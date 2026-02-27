import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, TableMeta } from '@prisma/client';

export interface ComputedConfig {
  dependencyGraph: { [columnName: string]: string[] };
  executionOrder?: string[]; // Topologically sorted order
}

export interface UpdateComputedConfigParams {
  tableId: string;
  columnName: string;
  dependencies: string[];
  prisma: Prisma.TransactionClient;
}

type ColumnErrorInfo = {
  column: string;
  reason: string;
  missingDependencies: string[];
};

@Injectable()
export class ComputedConfigManager {
  /**
   * Safely parses computedConfig from JSON
   */
  parseComputedConfig(config: any): ComputedConfig {
    if (!config || typeof config !== 'object') {
      return {
        dependencyGraph: {},
        executionOrder: [],
      };
    }

    return {
      dependencyGraph: config.dependencyGraph || {},
      executionOrder: config.executionOrder || [],
    };
  }

  /**
   * Updates the computedConfig for a table with new formula field configuration
   * Performs topological sorting to determine execution order
   */
  async updateComputedConfig(
    params: UpdateComputedConfigParams,
  ): Promise<ComputedConfig> {
    const { tableId, columnName, dependencies, prisma } = params;

    // Get current computedConfig
    const tableMeta = await prisma.tableMeta.findUnique({
      where: { id: tableId },
      select: { computedConfig: true },
    });

    if (!tableMeta) {
      throw new BadRequestException(`Table with id ${tableId} not found`);
    }

    // Parse current config or initialize empty
    const currentConfig = this.parseComputedConfig(tableMeta.computedConfig);

    // Update dependency graph
    const updatedDependencyGraph = {
      ...currentConfig.dependencyGraph,
      [columnName]: dependencies,
    };

    // Perform topological sort to get execution order
    const executionOrder = this.performTopologicalSort(updatedDependencyGraph);

    // Check for circular dependencies
    if (executionOrder.length !== Object.keys(updatedDependencyGraph).length) {
      throw new BadRequestException(
        'Circular dependency detected in formula fields',
      );
    }

    // Create updated config
    const updatedConfig: ComputedConfig = {
      dependencyGraph: updatedDependencyGraph,
      executionOrder,
    };

    // Update the database
    await prisma.tableMeta.update({
      where: { id: tableId },
      data: { computedConfig: updatedConfig as any },
    });

    return updatedConfig;
  }

  /**
   * Removes a formula field from computedConfig
   */

  async removeComputedField(
    tableId: string,
    columnName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<{
    updatedConfig: ComputedConfig;
    erroredColumns: ColumnErrorInfo[];
  }> {
    const tableMeta = await prisma.tableMeta.findUnique({
      where: { id: tableId },
      select: { computedConfig: true },
    });

    if (!tableMeta) {
      throw new BadRequestException(`Table with id ${tableId} not found`);
    }

    const currentConfig = this.parseComputedConfig(tableMeta.computedConfig);

    const updatedDependencyGraph = { ...currentConfig.dependencyGraph };
    const updatedExecutionOrder = [...(currentConfig.executionOrder || [])];
    delete updatedDependencyGraph[columnName]; // Step 1: delete the node

    // step 1: Remove the dbFieldName from the executionOrder
    updatedExecutionOrder.forEach((fieldName, index) => {
      if (fieldName === columnName) {
        updatedExecutionOrder.splice(index, 1);
      }
    });

    const erroredColumns = new Map<string, Set<string>>(); // column => Set of missing dependencies

    // Step 2: Remove direct references to deleted column and track error
    for (const [col, deps] of Object.entries(updatedDependencyGraph)) {
      if (deps.includes(columnName)) {
        // updatedDependencyGraph[col] = deps.filter((dep) => dep !== columnName);
        erroredColumns.set(col, new Set([columnName]));
      }
    }

    // Step 3: Propagate errors transitively without changing deps
    const queue = Array.from(erroredColumns.keys());
    const alreadyErrored = new Set(queue);

    while (queue.length > 0) {
      const errored = queue.shift()!;
      for (const [col, deps] of Object.entries(updatedDependencyGraph)) {
        if (deps.includes(errored) && !alreadyErrored.has(col)) {
          alreadyErrored.add(col);
          queue.push(col);
          if (!erroredColumns.has(col)) {
            erroredColumns.set(col, new Set());
          }
          erroredColumns.get(col)!.add(errored);
        }
      }
    }

    // const executionOrder = this.performTopologicalSort(updatedDependencyGraph);

    const updatedConfig: ComputedConfig = {
      dependencyGraph: updatedDependencyGraph,
      executionOrder: updatedExecutionOrder,
    };

    await prisma.tableMeta.update({
      where: { id: tableId },
      data: { computedConfig: updatedConfig as any },
    });

    return {
      updatedConfig,
      erroredColumns: Array.from(erroredColumns.entries()).map(
        ([column, reasonsSet]) => {
          const missingDependencies = Array.from(reasonsSet);
          return {
            column,
            missingDependencies,
            reason: `Missing dependency: ${missingDependencies.join(', ')}`,
          };
        },
      ),
    };
  }

  /**
   * Gets the computedConfig for a table
   */
  async getComputedConfig(
    tableId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<ComputedConfig | null> {
    const tableMeta = await prisma.tableMeta.findUnique({
      where: { id: tableId },
      select: { computedConfig: true },
    });

    if (!tableMeta) {
      return null;
    }

    return this.parseComputedConfig(tableMeta.computedConfig);
  }

  /**
   * Performs topological sort using Kahn's algorithm
   * Returns array of column names in execution order (dependencies first)
   */
  performTopologicalSort(dependencyGraph: {
    [columnName: string]: string[];
  }): string[] {
    const result: string[] = [];
    const inDegree: { [key: string]: number } = {};
    const queue: string[] = [];

    // Initialize in-degree count for all nodes
    Object.keys(dependencyGraph).forEach((node) => {
      inDegree[node] = 0;
    });

    // Calculate in-degree for each node
    Object.values(dependencyGraph).forEach((dependencies) => {
      dependencies.forEach((dep) => {
        if (inDegree.hasOwnProperty(dep)) {
          inDegree[dep]++;
        }
      });
    });

    // Add nodes with in-degree 0 to queue
    Object.keys(inDegree).forEach((node) => {
      if (inDegree[node] === 0) {
        queue.push(node);
      }
    });

    // Process queue
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      // Reduce in-degree for all neighbors
      if (dependencyGraph[current]) {
        dependencyGraph[current].forEach((dep) => {
          if (inDegree.hasOwnProperty(dep)) {
            inDegree[dep]--;
            if (inDegree[dep] === 0) {
              queue.push(dep);
            }
          }
        });
      }
    }

    // Reverse the result to get evaluation order (dependencies first)
    return result.reverse();
  }

  /**
   * Validates if adding a new dependency would create a circular dependency
   */
  validateDependency(
    columnName: string,
    dependencies: string[],
    existingGraph: { [columnName: string]: string[] },
  ): boolean {
    // Create a temporary graph with the new dependency
    const tempGraph = {
      ...existingGraph,
      [columnName]: dependencies,
    };

    // Check if topological sort returns all nodes
    const executionOrder = this.performTopologicalSort(tempGraph);
    const allNodes = new Set([...Object.keys(existingGraph), columnName]);

    return executionOrder.length === allNodes.size;
  }

  /**
   * Gets all dependencies for a specific column (including transitive dependencies)
   */
  getTransitiveDependencies(
    columnName: string,
    dependencyGraph: { [columnName: string]: string[] },
  ): Set<string> {
    const visited = new Set<string>();
    const dependencies = new Set<string>();

    const dfs = (node: string) => {
      if (visited.has(node)) return;
      visited.add(node);

      if (dependencyGraph[node]) {
        dependencyGraph[node].forEach((dep) => {
          dependencies.add(dep);
          dfs(dep);
        });
      }
    };

    dfs(columnName);
    return dependencies;
  }

  /**
   * Gets all columns that depend on a specific column
   */
  getDependentColumns(
    columnName: string,
    dependencyGraph: { [columnName: string]: string[] },
  ): string[] {
    return Object.keys(dependencyGraph).filter((col) =>
      dependencyGraph[col].includes(columnName),
    );
  }

  buildEnrichmentDependencyGraph(
    identifierFields: { dbFieldName: string }[],
    selectedFields: { dbFieldName: string }[],
    enrichedField: { dbFieldName: string },
  ): { [columnName: string]: string[] } {
    const graph: { [columnName: string]: string[] } = {};

    // Filter out any undefined/null dbFieldName values
    graph[enrichedField.dbFieldName] =
      identifierFields
        ?.map((f) => f.dbFieldName)
        .filter((fieldName): fieldName is string => fieldName != null) || [];

    // Each selected field depends on the enriched field
    for (const field of selectedFields || []) {
      if (field.dbFieldName) {
        // Add null check here too
        graph[field.dbFieldName] = [enrichedField.dbFieldName];
      }
    }

    return graph;
  }

  /**
   * Adds enrichment dependencies to the table's computedConfig,
   * merges with existing dependencies, sorts, and updates tableMeta.
   */
}
