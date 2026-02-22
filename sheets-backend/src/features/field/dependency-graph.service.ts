import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

@Injectable()
export class DependencyGraphService {
  constructor(private readonly emitter: EventEmitterService) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'dependency.getTopoOrder', handler: this.handleGetTopoOrder },
    ];

    events.forEach(({ name, handler }) => {
      this.emitter.onEvent(name, handler.bind(this));
    });
  }

  async handleGetTopoOrder(
    payload: { fieldIds: number[] },
    prisma: Prisma.TransactionClient,
  ) {
    return this.getTopoOrder(payload.fieldIds, prisma);
  }

  async getDownstreamFieldIds(
    startFieldIds: number[],
    prisma: Prisma.TransactionClient,
  ): Promise<number[]> {
    if (startFieldIds.length === 0) return [];

    try {
      const result: { field_id: number }[] = await prisma.$queryRawUnsafe(
        `WITH RECURSIVE downstream AS (
          SELECT "toFieldId" as field_id FROM "reference" WHERE "fromFieldId" = ANY($1::int[])
          UNION
          SELECT r."toFieldId" FROM "reference" r INNER JOIN downstream d ON r."fromFieldId" = d.field_id
        )
        SELECT DISTINCT field_id FROM downstream`,
        startFieldIds,
      );

      return result.map((r) => r.field_id);
    } catch (error) {
      console.error('Failed to get downstream field IDs:', error);
      return [];
    }
  }

  async getTopoOrder(
    fieldIds: number[],
    prisma: Prisma.TransactionClient,
  ): Promise<number[]> {
    if (fieldIds.length === 0) return [];

    const downstreamIds = await this.getDownstreamFieldIds(fieldIds, prisma);
    const allFieldIds = [...new Set([...fieldIds, ...downstreamIds])];

    if (allFieldIds.length === 0) return [];

    const references = await prisma.reference.findMany({
      where: {
        OR: [
          { fromFieldId: { in: allFieldIds } },
          { toFieldId: { in: allFieldIds } },
        ],
      },
    });

    const adjacency = new Map<number, number[]>();
    const allNodes = new Set<number>(allFieldIds);

    for (const ref of references) {
      allNodes.add(ref.fromFieldId);
      allNodes.add(ref.toFieldId);

      if (!adjacency.has(ref.fromFieldId)) {
        adjacency.set(ref.fromFieldId, []);
      }
      adjacency.get(ref.fromFieldId)!.push(ref.toFieldId);
    }

    const visited = new Set<number>();
    const visiting = new Set<number>();
    const sorted: number[] = [];

    const dfs = (node: number) => {
      if (visited.has(node)) return;
      if (visiting.has(node)) {
        console.warn(`Cycle detected in dependency graph at field ${node}, breaking cycle`);
        return;
      }

      visiting.add(node);

      const neighbors = adjacency.get(node) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }

      visiting.delete(node);
      visited.add(node);
      sorted.push(node);
    };

    for (const node of allNodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return sorted.reverse();
  }
}
