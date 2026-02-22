import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { DependencyGraphService } from './dependency-graph.service';
import { LookupRollupService } from './lookup-rollup.service';

@Injectable()
export class ComputedRecalcService {
  constructor(
    private readonly emitter: EventEmitterService,
    private readonly dependencyGraph: DependencyGraphService,
    private readonly lookupRollup: LookupRollupService,
  ) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      {
        name: 'recalc.triggerRecalculation',
        handler: this.handleTriggerRecalculation,
      },
    ];

    events.forEach(({ name, handler }) => {
      this.emitter.onEvent(name, handler.bind(this));
    });
  }

  async handleTriggerRecalculation(
    payload: {
      tableId: string;
      baseId: string;
      changedFieldIds: number[];
      changedRecordIds: number[];
    },
    prisma: Prisma.TransactionClient,
  ) {
    return this.triggerRecalculation(payload, prisma);
  }

  async triggerRecalculation(
    payload: {
      tableId: string;
      baseId: string;
      changedFieldIds: number[];
      changedRecordIds: number[];
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, baseId, changedFieldIds, changedRecordIds } = payload;

    if (changedFieldIds.length === 0) return;

    const downstreamIds = await this.dependencyGraph.getDownstreamFieldIds(
      changedFieldIds,
      prisma,
    );

    if (downstreamIds.length === 0) return;

    const topoOrder = await this.dependencyGraph.getTopoOrder(
      changedFieldIds,
      prisma,
    );

    const fieldsToRecalc = topoOrder.filter((id) =>
      downstreamIds.includes(id),
    );

    if (fieldsToRecalc.length === 0) return;

    const fieldRecords = await prisma.field.findMany({
      where: {
        id: { in: fieldsToRecalc },
        status: 'active',
      },
    });

    const fieldMap = new Map(fieldRecords.map((f) => [f.id, f]));

    const allFields = await prisma.field.findMany({
      where: {
        tableMetaId: tableId,
        status: 'active',
      },
    });

    let recordIds = changedRecordIds;
    if (!recordIds || recordIds.length === 0) {
      const [sourceDbName] = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );
      if (sourceDbName) {
        const [sSchema, sTable] = sourceDbName.split('.');
        const allRecords: any[] = await prisma.$queryRawUnsafe(
          `SELECT __id FROM "${sSchema}"."${sTable}" WHERE __status = 'active'`,
        );
        recordIds = allRecords.map((r: any) => Number(r.__id));
      }
      if (!recordIds || recordIds.length === 0) return;
    }

    const updatedCells: any[] = [];

    for (const fieldId of fieldsToRecalc) {
      const field = fieldMap.get(fieldId);
      if (!field) continue;

      try {
        if (field.type === 'LOOKUP') {
          const lookupOpts: any = field.lookupOptions || field.options;
          if (!lookupOpts?.linkFieldId) continue;

          const linkField = allFields.find(
            (f) =>
              f.id === parseInt(lookupOpts.linkFieldId) ||
              f.id === lookupOpts.linkFieldId,
          );
          if (!linkField || linkField.type !== 'LINK') continue;

          const results = await this.recalcLookupForRecords(
            field,
            linkField,
            recordIds,
            baseId,
            tableId,
            prisma,
          );
          updatedCells.push(...results);
        } else if (field.type === 'ROLLUP') {
          const rollupOpts: any = field.lookupOptions || field.options;
          if (!rollupOpts?.linkFieldId) continue;

          const linkField = allFields.find(
            (f) =>
              f.id === parseInt(rollupOpts.linkFieldId) ||
              f.id === rollupOpts.linkFieldId,
          );
          if (!linkField || linkField.type !== 'LINK') continue;

          const results = await this.recalcRollupForRecords(
            field,
            linkField,
            recordIds,
            baseId,
            tableId,
            prisma,
          );
          updatedCells.push(...results);
        }
      } catch (error) {
        console.error(
          `Failed to recalculate field ${fieldId}:`,
          error,
        );
      }
    }

    if (updatedCells.length > 0) {
      try {
        const recordIdSet = new Set<number>();
        const fieldIdSet = new Set<number>();
        const values: { [recordId: number]: { [fieldDbName: string]: any } } = {};

        for (const cell of updatedCells) {
          recordIdSet.add(cell.recordId);
          fieldIdSet.add(cell.fieldId);
          if (!values[cell.recordId]) values[cell.recordId] = {};
          values[cell.recordId][cell.fieldDbName || String(cell.fieldId)] = cell.value;
        }

        this.emitter.emit('recalc.broadcastChanges', {
          tableId,
          baseId,
          recordIds: Array.from(recordIdSet),
          fieldIds: Array.from(fieldIdSet),
          values,
        });
      } catch (error) {
        console.error('Failed to broadcast recalc changes:', error);
      }
    }

    return updatedCells;
  }

  async recalcLookupForRecords(
    lookupField: any,
    linkField: any,
    recordIds: number[],
    baseId: string,
    tableId: string,
    prisma: Prisma.TransactionClient,
  ) {
    const lookupOpts: any = lookupField.lookupOptions || lookupField.options;
    const { lookupFieldId, foreignTableId } = lookupOpts;
    const linkOptions = linkField.options as any;
    const { relationship, fkHostTableName, selfKeyName, foreignKeyName } =
      linkOptions;

    if (!fkHostTableName || !selfKeyName || !foreignKeyName) return [];
    if (!lookupFieldId || !foreignTableId) return [];

    let lookupDbFieldName: string | undefined;
    try {
      const [lookupFieldRecords] = await this.emitter.emitAsync(
        'field.getFieldsById',
        { ids: [parseInt(lookupFieldId)] },
        prisma,
      );
      if (lookupFieldRecords?.[0]?.dbFieldName) {
        lookupDbFieldName = lookupFieldRecords[0].dbFieldName;
      }
    } catch {
      return [];
    }

    if (!lookupDbFieldName) return [];

    const [foreignDbName] = await this.emitter.emitAsync(
      'table.getDbName',
      foreignTableId,
      baseId,
      prisma,
    );
    if (!foreignDbName) return [];
    const [foreignSchema, foreignTable] = foreignDbName.split('.');

    const [sourceDbName] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );
    if (!sourceDbName) return [];
    const [srcSchema, srcTable] = sourceDbName.split('.');

    const updatedCells: any[] = [];
    const idsStr = recordIds.join(', ');

    let lookupData: any[] = [];

    try {
      if (relationship === 'ManyMany') {
        const [jSchema, jTable] = fkHostTableName.split('.');
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT j."${selfKeyName}" as source_id,
                 ft."${lookupDbFieldName}" as lookup_value
          FROM "${jSchema}"."${jTable}" j
          JOIN "${foreignSchema}"."${foreignTable}" ft ON ft.__id = j."${foreignKeyName}"
          WHERE j."${selfKeyName}" IN (${idsStr})
          AND ft.__status = 'active'
          ORDER BY j.__order
        `);
      } else if (relationship === 'OneMany') {
        const [fkSchema, fkTable] = fkHostTableName.split('.');
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT "${selfKeyName}" as source_id,
                 "${lookupDbFieldName}" as lookup_value
          FROM "${fkSchema}"."${fkTable}"
          WHERE "${selfKeyName}" IN (${idsStr})
          AND __status = 'active'
        `);
      } else if (relationship === 'ManyOne') {
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT s.__id as source_id,
                 ft."${lookupDbFieldName}" as lookup_value
          FROM "${srcSchema}"."${srcTable}" s
          JOIN "${foreignSchema}"."${foreignTable}" ft ON ft.__id = s."${foreignKeyName}"
          WHERE s.__id IN (${idsStr})
          AND s.__status = 'active'
          AND ft.__status = 'active'
        `);
      } else if (relationship === 'OneOne') {
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT ft."${selfKeyName}" as source_id,
                 ft."${lookupDbFieldName}" as lookup_value
          FROM "${foreignSchema}"."${foreignTable}" ft
          WHERE ft."${selfKeyName}" IN (${idsStr})
          AND ft.__status = 'active'
        `);
      }
    } catch (error) {
      console.error(`Failed to query lookup data for field ${lookupField.id}:`, error);
      return [];
    }

    const lookupMap = new Map<number, any[]>();
    lookupData.forEach((row: any) => {
      const sourceId = Number(row.source_id);
      if (!lookupMap.has(sourceId)) {
        lookupMap.set(sourceId, []);
      }
      lookupMap.get(sourceId)!.push(row.lookup_value);
    });

    const isMultiValue =
      relationship === 'ManyMany' || relationship === 'OneMany';

    for (const recordId of recordIds) {
      const values = lookupMap.get(recordId) || [];
      const cellValue = isMultiValue
        ? values.length > 0
          ? values
          : null
        : values.length > 0
          ? values[0]
          : null;

      const dbValue =
        cellValue !== null && typeof cellValue === 'object'
          ? JSON.stringify(cellValue)
          : cellValue;

      try {
        await prisma.$queryRawUnsafe(
          `UPDATE "${srcSchema}"."${srcTable}" SET "${lookupField.dbFieldName}" = $1 WHERE __id = $2`,
          dbValue,
          recordId,
        );
        updatedCells.push({
          recordId,
          fieldId: lookupField.id,
          fieldDbName: lookupField.dbFieldName,
          value: dbValue,
        });
      } catch (error) {
        console.error(
          `Failed to update lookup value for record ${recordId}:`,
          error,
        );
      }
    }

    return updatedCells;
  }

  async recalcRollupForRecords(
    rollupField: any,
    linkField: any,
    recordIds: number[],
    baseId: string,
    tableId: string,
    prisma: Prisma.TransactionClient,
  ) {
    const rollupOpts: any = rollupField.lookupOptions || rollupField.options;
    const { lookupFieldId, foreignTableId } = rollupOpts;
    const expression = rollupField.options?.expression;
    const linkOptions = linkField.options as any;
    const { relationship, fkHostTableName, selfKeyName, foreignKeyName } =
      linkOptions;

    if (!fkHostTableName || !selfKeyName || !foreignKeyName) return [];
    if (!lookupFieldId || !foreignTableId || !expression) return [];

    let lookupDbFieldName: string | undefined;
    try {
      const [lookupFieldRecords] = await this.emitter.emitAsync(
        'field.getFieldsById',
        { ids: [parseInt(lookupFieldId)] },
        prisma,
      );
      if (lookupFieldRecords?.[0]?.dbFieldName) {
        lookupDbFieldName = lookupFieldRecords[0].dbFieldName;
      }
    } catch {
      return [];
    }

    if (!lookupDbFieldName) return [];

    const [foreignDbName] = await this.emitter.emitAsync(
      'table.getDbName',
      foreignTableId,
      baseId,
      prisma,
    );
    if (!foreignDbName) return [];
    const [foreignSchema, foreignTable] = foreignDbName.split('.');

    const [sourceDbName] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );
    if (!sourceDbName) return [];
    const [srcSchema, srcTable] = sourceDbName.split('.');

    const updatedCells: any[] = [];
    const idsStr = recordIds.join(', ');

    let lookupData: any[] = [];

    try {
      if (relationship === 'ManyMany') {
        const [jSchema, jTable] = fkHostTableName.split('.');
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT j."${selfKeyName}" as source_id,
                 ft."${lookupDbFieldName}" as lookup_value
          FROM "${jSchema}"."${jTable}" j
          JOIN "${foreignSchema}"."${foreignTable}" ft ON ft.__id = j."${foreignKeyName}"
          WHERE j."${selfKeyName}" IN (${idsStr})
          AND ft.__status = 'active'
          ORDER BY j.__order
        `);
      } else if (relationship === 'OneMany') {
        const [fkSchema, fkTable] = fkHostTableName.split('.');
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT "${selfKeyName}" as source_id,
                 "${lookupDbFieldName}" as lookup_value
          FROM "${fkSchema}"."${fkTable}"
          WHERE "${selfKeyName}" IN (${idsStr})
          AND __status = 'active'
        `);
      } else if (relationship === 'ManyOne') {
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT s.__id as source_id,
                 ft."${lookupDbFieldName}" as lookup_value
          FROM "${srcSchema}"."${srcTable}" s
          JOIN "${foreignSchema}"."${foreignTable}" ft ON ft.__id = s."${foreignKeyName}"
          WHERE s.__id IN (${idsStr})
          AND s.__status = 'active'
          AND ft.__status = 'active'
        `);
      } else if (relationship === 'OneOne') {
        lookupData = await prisma.$queryRawUnsafe(`
          SELECT ft."${selfKeyName}" as source_id,
                 ft."${lookupDbFieldName}" as lookup_value
          FROM "${foreignSchema}"."${foreignTable}" ft
          WHERE ft."${selfKeyName}" IN (${idsStr})
          AND ft.__status = 'active'
        `);
      }
    } catch (error) {
      console.error(`Failed to query rollup data for field ${rollupField.id}:`, error);
      return [];
    }

    const lookupMap = new Map<number, any[]>();
    lookupData.forEach((row: any) => {
      const sourceId = Number(row.source_id);
      if (!lookupMap.has(sourceId)) {
        lookupMap.set(sourceId, []);
      }
      lookupMap.get(sourceId)!.push(row.lookup_value);
    });

    for (const recordId of recordIds) {
      const values = lookupMap.get(recordId) || [];
      const aggregated = this.lookupRollup.applyRollupFunction(
        expression,
        values,
      );

      const dbValue =
        aggregated !== null && typeof aggregated === 'object'
          ? JSON.stringify(aggregated)
          : aggregated;

      try {
        await prisma.$queryRawUnsafe(
          `UPDATE "${srcSchema}"."${srcTable}" SET "${rollupField.dbFieldName}" = $1 WHERE __id = $2`,
          dbValue !== null ? String(dbValue) : null,
          recordId,
        );
        updatedCells.push({
          recordId,
          fieldId: rollupField.id,
          fieldDbName: rollupField.dbFieldName,
          value: dbValue,
        });
      } catch (error) {
        console.error(
          `Failed to update rollup value for record ${recordId}:`,
          error,
        );
      }
    }

    return updatedCells;
  }
}
