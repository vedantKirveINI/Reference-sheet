import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoDashStatic } from 'lodash';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { FormulaEngineService } from './formula-engine/formula-engine.service';
import { FormulaExpression } from './formula-engine/types';

export interface FormulaRecalculationResult {
  columnName: string;
  value: any;
  rowId?: number;
}

@Injectable()
export class FormulaRecalculatorService {
  constructor(
    private readonly emitter: EventEmitterService,
    @Inject('Lodash') private readonly lodash: LoDashStatic,
    private readonly formulaEngine: FormulaEngineService,
  ) {}

  /**
   * Identifies which formula columns need to be recalculated based on updated columns
   * Handles both direct and transitive dependencies
   */
  async identifyFormulaColumnsToRecalculate(
    tableId: string,
    updatedColumnNames: string[],
    prisma: Prisma.TransactionClient,
  ): Promise<string[]> {
    try {
      const [computedConfig] = await this.emitter.emitAsync(
        'table.getFormulaFieldConfig',
        tableId,
        prisma,
      );

      console.log('computedConfig--->>', computedConfig, typeof computedConfig);

      if (
        this.lodash.isEmpty(computedConfig) ||
        this.lodash.isEmpty(computedConfig.dependencyGraph)
      ) {
        console.log('No computed config found');
        return [];
      }

      const columnsToRecalculate = new Set<string>();
      const visited = new Set<string>();

      // Recursive function to find all dependent columns
      const findDependentColumns = (columnName: string) => {
        if (visited.has(columnName)) return;
        visited.add(columnName);

        // Find all formula columns that depend on this column
        Object.entries(computedConfig.dependencyGraph).forEach(
          ([formulaColumn, dependencies]: any) => {
            if (dependencies.includes(columnName)) {
              columnsToRecalculate.add(formulaColumn);
              // Recursively find columns that depend on this formula column
              findDependentColumns(formulaColumn);
            }
          },
        );
      };

      // Start with the initially updated columns
      updatedColumnNames.forEach((columnName) => {
        findDependentColumns(columnName);
      });

      console.log('Columns to recalculate:', Array.from(columnsToRecalculate));
      return Array.from(columnsToRecalculate);
    } catch (error) {
      console.error('Error identifying formula columns to recalculate:', error);
      return [];
    }
  }

  /**
   * Gets the execution order for formula columns that need recalculation
   */
  async getFormulaExecutionOrder(
    tableId: string,
    formulaColumns: string[],
    prisma: Prisma.TransactionClient,
  ): Promise<string[]> {
    try {
      const [computedConfig] = await this.emitter.emitAsync(
        'table.getFormulaFieldConfig',
        tableId,
        prisma,
      );

      if (!computedConfig || !computedConfig.executionOrder) {
        return formulaColumns;
      }

      // Filter execution order to only include columns that need recalculation
      return computedConfig.executionOrder.filter((column) =>
        formulaColumns.includes(column),
      );
    } catch (error) {
      console.error('Error getting formula execution order:', error);
      return formulaColumns;
    }
  }

  /**
   * Calculates formula values for given columns with proper dependency handling
   */
  async calculateFormulaValues(
    tableId: string,
    baseId: string,
    formulaColumns: string[], // pass the execution order of the formula columns
    currentRecordData: Record<string, any>,
    updatedRecordData: Record<string, any>,
    prisma: Prisma.TransactionClient,
    rowId?: number,
  ): Promise<FormulaRecalculationResult[]> {
    const results: FormulaRecalculationResult[] = [];

    // Start with current data and merge in updated data
    const mergedRecordData = { ...currentRecordData, ...updatedRecordData };

    for (const columnName of formulaColumns) {
      try {
        // Get the formula expression for this column
        const { expression: formulaExpression, hasError } =
          await this.getComputedFieldMeta(tableId, columnName, prisma);
        console.log(
          'formulaExpression-->>',
          formulaExpression,
          'hasError',
          hasError,
        );

        if (!formulaExpression) {
          console.warn(`No formula expression found for column: ${columnName}`);
          continue;
        }

        let calculatedValue: any;
        if (hasError) {
          console.warn(
            `Formula field ${columnName} has error, setting value to null`,
          );
          calculatedValue = null; // Set to null instead of skipping
        } else {
          // Calculate formula using the engine
          calculatedValue = this.formulaEngine.evaluateFormula(
            formulaExpression,
            mergedRecordData,
          );
        }

        const result: FormulaRecalculationResult = {
          columnName,
          value: calculatedValue,
        };

        // Only include rowId if it's provided
        if (rowId !== undefined) {
          result.rowId = rowId;
        }

        results.push(result);

        // Update merged data with the newly calculated value for next formulas
        mergedRecordData[columnName] = calculatedValue;
      } catch (error) {
        console.error(
          `Error calculating formula for column ${columnName}:`,
          error,
        );
      }
    }

    return results;
  }

  /**
   * Get formula expression for a specific column
   */
  private async getComputedFieldMeta(
    tableId: string,
    columnName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<any> {
    try {
      // Get the field to find its computed_field_meta
      const field = await prisma.field.findFirst({
        where: {
          tableMetaId: tableId,
          dbFieldName: columnName,
          status: 'active',
        },
        select: {
          computedFieldMeta: true,
        },
      });

      if (
        !field?.computedFieldMeta ||
        typeof field.computedFieldMeta !== 'object'
      ) {
        return null;
      }

      const computedMeta = field.computedFieldMeta as {
        expression?: FormulaExpression;
        hasError?: boolean;
      };
      return computedMeta;
    } catch (error) {
      console.error(
        `Error getting formula expression for ${columnName}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Updates formula column values in the database
   */
  async updateFormulaColumnValues(
    tableId: string,
    baseId: string,
    formulaResults: FormulaRecalculationResult[],
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    if (formulaResults.length === 0) {
      return;
    }

    try {
      // Group results by row ID for batch updates
      const resultsByRow = this.groupResultsByRow(formulaResults);

      for (const [rowId, results] of Object.entries(resultsByRow)) {
        const updateData: Record<string, any> = {};

        results.forEach((result) => {
          updateData[result.columnName] = result.value;
        });

        const updateSQL = `
          UPDATE "${baseId}"."${tableId}"
          SET ${Object.keys(updateData)
            .map(
              (key) =>
                `"${key}" = $${Object.keys(updateData).indexOf(key) + 1}`,
            )
            .join(', ')}
          WHERE __id = $${Object.keys(updateData).length + 1}
        `;

        const values = [...Object.values(updateData), parseInt(rowId)];

        await prisma.$executeRawUnsafe(updateSQL, ...values);
      }
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to update formula column values: ${error.message}`,
      );
    }
  }

  /**
   * Groups formula results by row ID
   */
  private groupResultsByRow(
    results: FormulaRecalculationResult[],
  ): Record<string, FormulaRecalculationResult[]> {
    return results.reduce(
      (acc, result) => {
        const rowId = result.rowId?.toString();
        if (rowId && !acc[rowId]) {
          acc[rowId] = [];
        }
        if (rowId) {
          acc[rowId].push(result);
        }
        return acc;
      },
      {} as Record<string, FormulaRecalculationResult[]>,
    );
  }
}
