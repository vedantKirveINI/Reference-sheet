import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

export enum Relationship {
  OneOne = 'OneOne',
  OneMany = 'OneMany',
  ManyOne = 'ManyOne',
  ManyMany = 'ManyMany',
}

export interface LinkFieldOptions {
  relationship: Relationship;
  foreignTableId: string;
  lookupFieldId?: string;
  fkHostTableName?: string;
  selfKeyName?: string;
  foreignKeyName?: string;
  symmetricFieldId?: string;
  isOneWay?: boolean;
}

export interface LinkCellValue {
  id: number;
  title?: string;
}

@Injectable()
export class LinkFieldService {
  constructor(
    private readonly emitter: EventEmitterService,
    @Inject('ShortUUID') private shortUUID: any,
  ) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'link.createLinkField', handler: this.handleLinkFieldCreation },
      { name: 'link.deleteLinkField', handler: this.handleLinkFieldDeletion },
      { name: 'link.updateLinkCell', handler: this.updateLinkCell },
      { name: 'link.resolveLinkFields', handler: this.resolveLinkFields },
    ];

    events.forEach(({ name, handler }) => {
      this.emitter.onEvent(name, handler.bind(this));
    });
  }

  async handleLinkFieldCreation(
    payload: {
      fieldId: number;
      tableId: string;
      baseId: string;
      viewId?: string;
      dbFieldName?: string;
      options: LinkFieldOptions;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { fieldId, tableId, baseId, viewId, options } = payload;
    const { relationship, foreignTableId, isOneWay } = options;

    const selfKeyName = `__fk_${fieldId}`;
    const foreignKeyName = `__fk_${fieldId}_ref`;

    let fkHostTableName: string;
    let symmetricFieldId: string | undefined;

    if (relationship === Relationship.ManyMany) {
      fkHostTableName = await this.createJunctionTable(
        baseId,
        tableId,
        foreignTableId,
        selfKeyName,
        foreignKeyName,
        prisma,
      );
    } else if (
      relationship === Relationship.OneMany ||
      relationship === Relationship.ManyOne
    ) {
      const targetTableId =
        relationship === Relationship.OneMany ? foreignTableId : tableId;
      fkHostTableName = await this.addForeignKeyColumn(
        baseId,
        targetTableId,
        relationship === Relationship.OneMany ? selfKeyName : foreignKeyName,
        prisma,
      );
    } else {
      fkHostTableName = await this.addForeignKeyColumn(
        baseId,
        foreignTableId,
        selfKeyName,
        prisma,
      );

      try {
        const [fkSchema, fkTable] = fkHostTableName.split('.');
        await prisma.$queryRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "uq_${selfKeyName}" ON "${fkSchema}".${fkTable} ("${selfKeyName}") WHERE "${selfKeyName}" IS NOT NULL`,
        );
      } catch (err) {
        console.error('Failed to add unique constraint for OneOne:', err);
      }
    }

    if (!isOneWay) {
      symmetricFieldId = await this.createSymmetricField(
        fieldId,
        tableId,
        foreignTableId,
        baseId,
        viewId || '',
        relationship,
        fkHostTableName,
        selfKeyName,
        foreignKeyName,
        prisma,
      );
    }

    const updatedOptions: LinkFieldOptions = {
      ...options,
      fkHostTableName,
      selfKeyName,
      foreignKeyName,
      symmetricFieldId,
    };

    return { updatedOptions };
  }

  private async createJunctionTable(
    baseId: string,
    tableId: string,
    foreignTableId: string,
    selfKeyName: string,
    foreignKeyName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<string> {
    const junctionTableName = `junction_${tableId}_${foreignTableId}_${this.shortUUID.generate()}`;

    const createQuery = `
      CREATE TABLE IF NOT EXISTS "${baseId}"."${junctionTableName}" (
        __id SERIAL PRIMARY KEY,
        "${selfKeyName}" INTEGER NOT NULL,
        "${foreignKeyName}" INTEGER NOT NULL,
        __order SERIAL,
        __created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("${selfKeyName}", "${foreignKeyName}")
      )
    `;

    try {
      await prisma.$queryRawUnsafe(createQuery);
    } catch (error) {
      throw new BadRequestException(
        `Could not create junction table: ${error}`,
      );
    }

    return `${baseId}.${junctionTableName}`;
  }

  private async addForeignKeyColumn(
    baseId: string,
    tableId: string,
    columnName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<string> {
    const [table] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );

    if (!table) {
      throw new BadRequestException(`Table ${tableId} not found`);
    }

    const dbNameArray = table.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    const addColumnQuery = `
      ALTER TABLE "${schemaName}".${tableName}
      ADD COLUMN IF NOT EXISTS "${columnName}" INTEGER
    `;

    try {
      await prisma.$queryRawUnsafe(addColumnQuery);
    } catch (error) {
      throw new BadRequestException(
        `Could not add foreign key column: ${error}`,
      );
    }

    return table;
  }

  private async createSymmetricField(
    sourceFieldId: number,
    sourceTableId: string,
    foreignTableId: string,
    baseId: string,
    viewId: string,
    relationship: Relationship,
    fkHostTableName: string,
    selfKeyName: string,
    foreignKeyName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<string> {
    const reverseRelationship = this.getReverseRelationship(relationship);

    const sourceField = await prisma.field.findUnique({
      where: { id: sourceFieldId },
    });

    const sourceTable = await prisma.tableMeta.findUnique({
      where: { id: sourceTableId },
    });

    const symmetricFieldName = sourceTable?.name || 'Linked Record';

    const [foreignViews] = await this.emitter.emitAsync(
      'view.getViews',
      { tableId: foreignTableId, baseId },
      prisma,
    );

    const foreignViewId = foreignViews?.[0]?.id || viewId;

    const symmetricField = await prisma.field.create({
      data: {
        name: symmetricFieldName,
        type: 'LINK',
        dbFieldName: `__link_sym_${sourceFieldId}`,
        dbFieldType: 'JSONB',
        cellValueType: 'string',
        tableMetaId: foreignTableId,
        options: {
          relationship: reverseRelationship,
          foreignTableId: sourceTableId,
          lookupFieldId: sourceField?.id?.toString(),
          fkHostTableName,
          selfKeyName: foreignKeyName,
          foreignKeyName: selfKeyName,
          symmetricFieldId: sourceFieldId.toString(),
          isOneWay: false,
        },
      },
    });

    await this.emitter.emitAsync(
      'view.setFieldOrder',
      foreignViewId,
      [{ field_id: symmetricField.id, order: 999 }],
      prisma,
    );

    return symmetricField.id.toString();
  }

  private getReverseRelationship(relationship: Relationship): Relationship {
    switch (relationship) {
      case Relationship.OneMany:
        return Relationship.ManyOne;
      case Relationship.ManyOne:
        return Relationship.OneMany;
      case Relationship.OneOne:
        return Relationship.OneOne;
      case Relationship.ManyMany:
        return Relationship.ManyMany;
    }
  }

  async handleLinkFieldDeletion(
    payload: {
      fieldId: number;
      tableId: string;
      baseId: string;
      options: LinkFieldOptions;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { options } = payload;

    if (
      options.relationship === Relationship.ManyMany &&
      options.fkHostTableName
    ) {
      const [schemaName, tableName] = options.fkHostTableName.split('.');
      try {
        await prisma.$queryRawUnsafe(
          `DROP TABLE IF EXISTS "${schemaName}"."${tableName}"`,
        );
      } catch (error) {
        console.error('Failed to drop junction table:', error);
      }
    }

    if (options.symmetricFieldId) {
      try {
        await prisma.field.update({
          where: { id: parseInt(options.symmetricFieldId) },
          data: { status: 'inactive' },
        });
      } catch (error) {
        console.error('Failed to deactivate symmetric field:', error);
      }
    }
  }

  async updateLinkCell(
    payload: {
      tableId: string;
      baseId: string;
      fieldId: number;
      recordId: number;
      linkedRecordIds: number[];
      options: LinkFieldOptions;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { recordId, linkedRecordIds, options } = payload;
    const { relationship, fkHostTableName, selfKeyName, foreignKeyName } =
      options;

    if (!fkHostTableName || !selfKeyName || !foreignKeyName) {
      throw new BadRequestException('Link field options are incomplete');
    }

    const safeRecordId = Number(recordId);
    const safeLinkedIds = linkedRecordIds.map((id) => Number(id));
    if (isNaN(safeRecordId) || safeLinkedIds.some(isNaN)) {
      throw new BadRequestException('Invalid record IDs');
    }

    if (relationship === Relationship.ManyMany) {
      const [schemaName, tableName] = fkHostTableName.split('.');

      await prisma.$queryRawUnsafe(
        `DELETE FROM "${schemaName}"."${tableName}" WHERE "${selfKeyName}" = $1`,
        safeRecordId,
      );

      for (const linkedId of safeLinkedIds) {
        await prisma.$queryRawUnsafe(
          `INSERT INTO "${schemaName}"."${tableName}" ("${selfKeyName}", "${foreignKeyName}") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          safeRecordId,
          linkedId,
        );
      }
    } else if (
      relationship === Relationship.OneMany
    ) {
      const [schemaName, tableName] = fkHostTableName.split('.');

      await prisma.$queryRawUnsafe(
        `UPDATE "${schemaName}"."${tableName}" SET "${selfKeyName}" = NULL WHERE "${selfKeyName}" = $1`,
        safeRecordId,
      );

      for (const linkedId of safeLinkedIds) {
        await prisma.$queryRawUnsafe(
          `UPDATE "${schemaName}"."${tableName}" SET "${selfKeyName}" = $1 WHERE __id = $2`,
          safeRecordId,
          linkedId,
        );
      }
    } else if (relationship === Relationship.ManyOne) {
      const [sourceDbName] = await this.emitter.emitAsync(
        'table.getDbName',
        payload.tableId,
        payload.baseId,
        prisma,
      );
      if (!sourceDbName) throw new BadRequestException('Source table not found');
      const [schemaName, tableName] = sourceDbName.split('.');

      const linkedId = safeLinkedIds.length > 0 ? safeLinkedIds[0] : null;

      await prisma.$queryRawUnsafe(
        `UPDATE "${schemaName}"."${tableName}" SET "${foreignKeyName}" = $1 WHERE __id = $2`,
        linkedId,
        safeRecordId,
      );
    } else if (relationship === Relationship.OneOne) {
      const [schemaName, tableName] = fkHostTableName.split('.');

      await prisma.$queryRawUnsafe(
        `UPDATE "${schemaName}"."${tableName}" SET "${selfKeyName}" = NULL WHERE "${selfKeyName}" = $1`,
        safeRecordId,
      );

      if (safeLinkedIds.length > 0) {
        await prisma.$queryRawUnsafe(
          `UPDATE "${schemaName}"."${tableName}" SET "${selfKeyName}" = NULL WHERE __id = $1`,
          safeLinkedIds[0],
        );
        await prisma.$queryRawUnsafe(
          `UPDATE "${schemaName}"."${tableName}" SET "${selfKeyName}" = $1 WHERE __id = $2`,
          safeRecordId,
          safeLinkedIds[0],
        );
      }
    }

    if (options.symmetricFieldId) {
      try {
        const symFieldId = typeof options.symmetricFieldId === 'string'
          ? parseInt(options.symmetricFieldId, 10)
          : options.symmetricFieldId;
        const symmetricField = await prisma.field.findUnique({
          where: { id: symFieldId },
        });
        if (symmetricField && options.foreignTableId) {
          await this.emitter.emitAsync('recalc.triggerRecalculation', {
            tableId: options.foreignTableId,
            baseId: payload.baseId,
            changedFieldIds: [symFieldId],
            changedRecordIds: safeLinkedIds,
          }, prisma);
        }
      } catch (err) {
        console.error('Bidirectional sync failed:', err);
      }
    }

    return { success: true };
  }

  async resolveLinkFields(
    payload: {
      records: any[];
      fields: any[];
      baseId: string;
      tableId: string;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { records, fields, baseId, tableId } = payload;

    const linkFields = fields.filter(
      (f: any) => f.type === 'LINK' && f.options?.foreignTableId,
    );

    if (linkFields.length === 0) return records;

    for (const linkField of linkFields) {
      const options: LinkFieldOptions = linkField.options;
      const {
        relationship,
        fkHostTableName,
        selfKeyName,
        foreignKeyName,
        foreignTableId,
        lookupFieldId,
      } = options;

      if (!fkHostTableName || !selfKeyName || !foreignKeyName) continue;

      const recordIds = records
        .map((r: any) => Number(r.__id?.value || r.__id))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (recordIds.length === 0) continue;

      const [foreignDbName] = await this.emitter.emitAsync(
        'table.getDbName',
        foreignTableId,
        baseId,
        prisma,
      );

      if (!foreignDbName) continue;

      const foreignDbArray = foreignDbName.split('.');
      const foreignSchema = foreignDbArray[0];
      const foreignTable = foreignDbArray[1];

      let lookupDbFieldName = '__id';
      if (lookupFieldId) {
        try {
          const [lookupFields] = await this.emitter.emitAsync(
            'field.getFieldsById',
            { ids: [parseInt(lookupFieldId)] },
            prisma,
          );
          if (lookupFields?.[0]?.dbFieldName) {
            lookupDbFieldName = lookupFields[0].dbFieldName;
          }
        } catch {}
      }

      let linkedData: any[] = [];

      try {
        if (relationship === Relationship.ManyMany) {
          const [jSchema, jTable] = fkHostTableName.split('.');
          const idsStr = recordIds.join(', ');

          linkedData = await prisma.$queryRawUnsafe(`
            SELECT j."${selfKeyName}" as source_id, 
                   ft.__id as linked_id, 
                   ft."${lookupDbFieldName}" as title
            FROM "${jSchema}"."${jTable}" j
            JOIN "${foreignSchema}".${foreignTable} ft ON ft.__id = j."${foreignKeyName}"
            WHERE j."${selfKeyName}" IN (${idsStr})
            AND ft.__status = 'active'
            ORDER BY j.__order
          `);
        } else if (relationship === Relationship.OneMany) {
          const [fkSchema, fkTable] = fkHostTableName.split('.');
          const idsStr = recordIds.join(', ');

          linkedData = await prisma.$queryRawUnsafe(`
            SELECT "${selfKeyName}" as source_id, 
                   __id as linked_id, 
                   "${lookupDbFieldName}" as title
            FROM "${fkSchema}".${fkTable}
            WHERE "${selfKeyName}" IN (${idsStr})
            AND __status = 'active'
          `);
        } else if (relationship === Relationship.ManyOne) {
          const [sourceDbName] = await this.emitter.emitAsync(
            'table.getDbName',
            tableId,
            baseId,
            prisma,
          );

          if (!sourceDbName) continue;
          const [srcSchema, srcTable] = sourceDbName.split('.');
          const idsStr = recordIds.join(', ');

          linkedData = await prisma.$queryRawUnsafe(`
            SELECT s.__id as source_id, 
                   ft.__id as linked_id, 
                   ft."${lookupDbFieldName}" as title
            FROM "${srcSchema}".${srcTable} s
            JOIN "${foreignSchema}".${foreignTable} ft ON ft.__id = s."${foreignKeyName}"
            WHERE s.__id IN (${idsStr})
            AND s.__status = 'active'
            AND ft.__status = 'active'
          `);
        } else if (relationship === Relationship.OneOne) {
          const idsStr = recordIds.join(', ');

          linkedData = await prisma.$queryRawUnsafe(`
            SELECT ft."${selfKeyName}" as source_id,
                   ft.__id as linked_id,
                   ft."${lookupDbFieldName}" as title
            FROM "${foreignSchema}".${foreignTable} ft
            WHERE ft."${selfKeyName}" IN (${idsStr})
            AND ft.__status = 'active'
          `);
        }
      } catch (error) {
        console.error(
          `Failed to resolve link field ${linkField.id}:`,
          error,
        );
        continue;
      }

      const linkedMap = new Map<number, LinkCellValue[]>();
      linkedData.forEach((row: any) => {
        const sourceId = Number(row.source_id);
        if (!linkedMap.has(sourceId)) {
          linkedMap.set(sourceId, []);
        }
        linkedMap.get(sourceId)!.push({
          id: Number(row.linked_id),
          title: String(row.title ?? ''),
        });
      });

      const isMultiValue =
        relationship === Relationship.ManyMany ||
        relationship === Relationship.OneMany;

      records.forEach((record: any) => {
        const recordId = Number(record.__id?.value || record.__id);
        const links = linkedMap.get(recordId) || [];

        const cellValue = isMultiValue
          ? links.length > 0
            ? links
            : null
          : links.length > 0
            ? links[0]
            : null;

        const key = linkField.dbFieldName || linkField.id;
        if (cellValue !== null) {
          record[key] = JSON.stringify(cellValue);
        }
      });
    }

    return records;
  }
}
