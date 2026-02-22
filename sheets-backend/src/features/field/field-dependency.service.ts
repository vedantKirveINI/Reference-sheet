import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

@Injectable()
export class FieldDependencyService {
  constructor(private readonly emitter: EventEmitterService) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      {
        name: 'dependency.createReferences',
        handler: this.handleCreateReferences,
      },
      {
        name: 'dependency.deleteReferences',
        handler: this.handleDeleteReferences,
      },
      {
        name: 'dependency.getDownstreamFields',
        handler: this.handleGetDownstreamFields,
      },
    ];

    events.forEach(({ name, handler }) => {
      this.emitter.onEvent(name, handler.bind(this));
    });
  }

  async handleCreateReferences(
    payload: { fieldId: number; dependsOnFieldIds: number[] },
    prisma: Prisma.TransactionClient,
  ) {
    const { fieldId, dependsOnFieldIds } = payload;
    return this.createReferences(fieldId, dependsOnFieldIds, prisma);
  }

  async handleDeleteReferences(
    payload: { fieldId: number },
    prisma: Prisma.TransactionClient,
  ) {
    return this.deleteReferences(payload.fieldId, prisma);
  }

  async handleGetDownstreamFields(
    payload: { fieldId: number },
    prisma: Prisma.TransactionClient,
  ) {
    const refs = await prisma.reference.findMany({
      where: { fromFieldId: payload.fieldId },
      select: { toFieldId: true },
    });
    return refs.map((r) => r.toFieldId);
  }

  async createReferences(
    fieldId: number,
    dependsOnFieldIds: number[],
    prisma: Prisma.TransactionClient,
  ) {
    await prisma.reference.deleteMany({
      where: { toFieldId: fieldId },
    });

    if (dependsOnFieldIds.length === 0) return;

    const data = dependsOnFieldIds.map((depId) => ({
      fromFieldId: depId,
      toFieldId: fieldId,
    }));

    await prisma.reference.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async deleteReferences(
    fieldId: number,
    prisma: Prisma.TransactionClient,
  ) {
    const downstreamRefs = await prisma.reference.findMany({
      where: { fromFieldId: fieldId },
      select: { toFieldId: true },
    });

    const affectedToFieldIds = downstreamRefs.map((r) => r.toFieldId);

    await prisma.reference.deleteMany({
      where: {
        OR: [{ fromFieldId: fieldId }, { toFieldId: fieldId }],
      },
    });

    return affectedToFieldIds;
  }

  getFieldReferenceIds(field: any, fields: any[]): number[] {
    const deps: number[] = [];

    switch (field.type) {
      case 'LINK': {
        const lookupFieldId = field.options?.lookupFieldId;
        if (lookupFieldId) {
          const id = parseInt(lookupFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        break;
      }
      case 'LOOKUP': {
        const lookupOpts = field.lookupOptions || field.options;
        if (lookupOpts?.linkFieldId) {
          const id = parseInt(lookupOpts.linkFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        if (lookupOpts?.lookupFieldId) {
          const id = parseInt(lookupOpts.lookupFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        break;
      }
      case 'ROLLUP': {
        const rollupOpts = field.lookupOptions || field.options;
        if (rollupOpts?.linkFieldId) {
          const id = parseInt(rollupOpts.linkFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        if (rollupOpts?.lookupFieldId) {
          const id = parseInt(rollupOpts.lookupFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        break;
      }
      case 'FORMULA': {
        const computedMeta = field.computedFieldMeta as any;
        const expression = computedMeta?.expression;
        if (expression?.blocks && Array.isArray(expression.blocks)) {
          for (const block of expression.blocks) {
            if (block.type === 'FIELDS' && block.tableData?.fieldId) {
              const id = parseInt(block.tableData.fieldId);
              if (!isNaN(id)) deps.push(id);
            } else if (block.type === 'FIELDS' && block.tableData?.dbFieldName) {
              const matchedField = fields.find(
                (f: any) => f.dbFieldName === block.tableData.dbFieldName,
              );
              if (matchedField) deps.push(matchedField.id);
            }
          }
        }
        break;
      }
      default:
        break;
    }

    return [...new Set(deps)];
  }
}
