import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

export const ROLLUP_FUNCTIONS = [
  'countall({values})',
  'counta({values})',
  'count({values})',
  'sum({values})',
  'average({values})',
  'max({values})',
  'min({values})',
  'and({values})',
  'or({values})',
  'xor({values})',
  'array_join({values})',
  'array_unique({values})',
  'array_compact({values})',
  'concatenate({values})',
] as const;

export type RollupFunction = (typeof ROLLUP_FUNCTIONS)[number];

export interface LookupOptions {
  linkFieldId: string;
  lookupFieldId: string;
  foreignTableId: string;
}

export interface RollupFieldOptions {
  expression: RollupFunction;
}

@Injectable()
export class LookupRollupService {
  constructor(private readonly emitter: EventEmitterService) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      {
        name: 'lookup.resolveLookupFields',
        handler: this.resolveLookupFields,
      },
      {
        name: 'rollup.resolveRollupFields',
        handler: this.resolveRollupFields,
      },
    ];

    events.forEach(({ name, handler }) => {
      this.emitter.onEvent(name, handler.bind(this));
    });
  }

  async resolveLookupFields(
    payload: {
      records: any[];
      fields: any[];
      baseId: string;
      tableId: string;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { records, fields, baseId, tableId } = payload;

    const lookupFields = fields.filter(
      (f: any) =>
        f.type === 'LOOKUP' &&
        (f.lookupOptions?.linkFieldId || f.options?.linkFieldId),
    );

    if (lookupFields.length === 0) return records;

    for (const lookupField of lookupFields) {
      const lookupOpts: LookupOptions =
        lookupField.lookupOptions || lookupField.options;
      const { linkFieldId, lookupFieldId, foreignTableId } = lookupOpts;

      if (!linkFieldId || !lookupFieldId || !foreignTableId) continue;

      const linkField = fields.find(
        (f: any) => f.id === parseInt(linkFieldId) || f.id === linkFieldId,
      );

      if (!linkField || linkField.type !== 'LINK' || !linkField.options) {
        continue;
      }

      const linkOptions = linkField.options;
      const {
        relationship,
        fkHostTableName,
        selfKeyName,
        foreignKeyName,
      } = linkOptions;

      if (!fkHostTableName || !selfKeyName || !foreignKeyName) continue;

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
        continue;
      }

      if (!lookupDbFieldName) continue;

      const [foreignDbName] = await this.emitter.emitAsync(
        'table.getDbName',
        foreignTableId,
        baseId,
        prisma,
      );
      if (!foreignDbName) continue;
      const [foreignSchema, foreignTable] = foreignDbName.split('.');

      const recordIds = records
        .map((r: any) => Number(r.__id?.value || r.__id))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (recordIds.length === 0) continue;

      let lookupData: any[] = [];

      try {
        if (relationship === 'ManyMany') {
          const [jSchema, jTable] = fkHostTableName.split('.');
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT j."${selfKeyName}" as source_id,
                   ft."${lookupDbFieldName}" as lookup_value
            FROM "${jSchema}"."${jTable}" j
            JOIN "${foreignSchema}".${foreignTable} ft ON ft.__id = j."${foreignKeyName}"
            WHERE j."${selfKeyName}" IN (${idsStr})
            AND ft.__status = 'active'
            ORDER BY j.__order
          `);
        } else if (relationship === 'OneMany') {
          const [fkSchema, fkTable] = fkHostTableName.split('.');
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT "${selfKeyName}" as source_id,
                   "${lookupDbFieldName}" as lookup_value
            FROM "${fkSchema}".${fkTable}
            WHERE "${selfKeyName}" IN (${idsStr})
            AND __status = 'active'
          `);
        } else if (relationship === 'ManyOne') {
          const [sourceDbName] = await this.emitter.emitAsync(
            'table.getDbName',
            tableId,
            baseId,
            prisma,
          );
          if (!sourceDbName) continue;
          const [srcSchema, srcTable] = sourceDbName.split('.');
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT s.__id as source_id,
                   ft."${lookupDbFieldName}" as lookup_value
            FROM "${srcSchema}".${srcTable} s
            JOIN "${foreignSchema}".${foreignTable} ft ON ft.__id = s."${foreignKeyName}"
            WHERE s.__id IN (${idsStr})
            AND s.__status = 'active'
            AND ft.__status = 'active'
          `);
        } else if (relationship === 'OneOne') {
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT ft."${selfKeyName}" as source_id,
                   ft."${lookupDbFieldName}" as lookup_value
            FROM "${foreignSchema}".${foreignTable} ft
            WHERE ft."${selfKeyName}" IN (${idsStr})
            AND ft.__status = 'active'
          `);
        }
      } catch (error) {
        console.error(
          `Failed to resolve lookup field ${lookupField.id}:`,
          error,
        );
        continue;
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

      records.forEach((record: any) => {
        const recordId = Number(record.__id?.value || record.__id);
        const values = lookupMap.get(recordId) || [];

        const cellValue = isMultiValue
          ? values.length > 0
            ? values
            : null
          : values.length > 0
            ? values[0]
            : null;

        record[lookupField.id] = {
          value: cellValue,
          normalizedValue: cellValue,
        };
      });
    }

    return records;
  }

  async resolveRollupFields(
    payload: {
      records: any[];
      fields: any[];
      baseId: string;
      tableId: string;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { records, fields, baseId, tableId } = payload;

    const rollupFields = fields.filter(
      (f: any) =>
        f.type === 'ROLLUP' &&
        (f.lookupOptions?.linkFieldId || f.options?.linkFieldId) &&
        f.options?.expression,
    );

    if (rollupFields.length === 0) return records;

    for (const rollupField of rollupFields) {
      const lookupOpts = rollupField.lookupOptions || rollupField.options;
      const { linkFieldId, lookupFieldId, foreignTableId } = lookupOpts;
      const expression = rollupField.options?.expression;

      if (!linkFieldId || !lookupFieldId || !foreignTableId) continue;

      const linkField = fields.find(
        (f: any) => f.id === parseInt(linkFieldId) || f.id === linkFieldId,
      );

      if (!linkField || linkField.type !== 'LINK' || !linkField.options) {
        continue;
      }

      const linkOptions = linkField.options;
      const { relationship, fkHostTableName, selfKeyName, foreignKeyName } =
        linkOptions;

      if (!fkHostTableName || !selfKeyName || !foreignKeyName) continue;

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
        continue;
      }

      if (!lookupDbFieldName) continue;

      const [foreignDbName] = await this.emitter.emitAsync(
        'table.getDbName',
        foreignTableId,
        baseId,
        prisma,
      );
      if (!foreignDbName) continue;
      const [foreignSchema, foreignTable] = foreignDbName.split('.');

      const recordIds = records
        .map((r: any) => Number(r.__id?.value || r.__id))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (recordIds.length === 0) continue;

      let lookupData: any[] = [];

      try {
        if (relationship === 'ManyMany') {
          const [jSchema, jTable] = fkHostTableName.split('.');
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT j."${selfKeyName}" as source_id,
                   ft."${lookupDbFieldName}" as lookup_value
            FROM "${jSchema}"."${jTable}" j
            JOIN "${foreignSchema}".${foreignTable} ft ON ft.__id = j."${foreignKeyName}"
            WHERE j."${selfKeyName}" IN (${idsStr})
            AND ft.__status = 'active'
            ORDER BY j.__order
          `);
        } else if (relationship === 'OneMany') {
          const [fkSchema, fkTable] = fkHostTableName.split('.');
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT "${selfKeyName}" as source_id,
                   "${lookupDbFieldName}" as lookup_value
            FROM "${fkSchema}".${fkTable}
            WHERE "${selfKeyName}" IN (${idsStr})
            AND __status = 'active'
          `);
        } else if (relationship === 'ManyOne') {
          const [sourceDbName] = await this.emitter.emitAsync(
            'table.getDbName',
            tableId,
            baseId,
            prisma,
          );
          if (!sourceDbName) continue;
          const [srcSchema, srcTable] = sourceDbName.split('.');
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT s.__id as source_id,
                   ft."${lookupDbFieldName}" as lookup_value
            FROM "${srcSchema}".${srcTable} s
            JOIN "${foreignSchema}".${foreignTable} ft ON ft.__id = s."${foreignKeyName}"
            WHERE s.__id IN (${idsStr})
            AND s.__status = 'active'
            AND ft.__status = 'active'
          `);
        } else if (relationship === 'OneOne') {
          const idsStr = recordIds.join(', ');

          lookupData = await prisma.$queryRawUnsafe(`
            SELECT ft."${selfKeyName}" as source_id,
                   ft."${lookupDbFieldName}" as lookup_value
            FROM "${foreignSchema}".${foreignTable} ft
            WHERE ft."${selfKeyName}" IN (${idsStr})
            AND ft.__status = 'active'
          `);
        }
      } catch (error) {
        console.error(
          `Failed to resolve rollup field ${rollupField.id}:`,
          error,
        );
        continue;
      }

      const lookupMap = new Map<number, any[]>();
      lookupData.forEach((row: any) => {
        const sourceId = Number(row.source_id);
        if (!lookupMap.has(sourceId)) {
          lookupMap.set(sourceId, []);
        }
        lookupMap.get(sourceId)!.push(row.lookup_value);
      });

      records.forEach((record: any) => {
        const recordId = Number(record.__id?.value || record.__id);
        const values = lookupMap.get(recordId) || [];

        const aggregated = this.applyRollupFunction(expression, values);

        record[rollupField.id] = {
          value: aggregated,
          normalizedValue: aggregated,
        };
      });
    }

    return records;
  }

  applyRollupFunction(expression: string, values: any[]): any {
    const numericValues = values
      .map((v) => Number(v))
      .filter((v) => !isNaN(v));
    const nonNullValues = values.filter(
      (v) => v !== null && v !== undefined && v !== '',
    );

    switch (expression) {
      case 'countall({values})':
        return values.length;

      case 'counta({values})':
        return nonNullValues.length;

      case 'count({values})':
        return numericValues.length;

      case 'sum({values})':
        return numericValues.reduce((acc, v) => acc + v, 0);

      case 'average({values})':
        if (numericValues.length === 0) return null;
        return (
          numericValues.reduce((acc, v) => acc + v, 0) / numericValues.length
        );

      case 'max({values})':
        if (numericValues.length === 0) return null;
        return Math.max(...numericValues);

      case 'min({values})':
        if (numericValues.length === 0) return null;
        return Math.min(...numericValues);

      case 'and({values})':
        return values.every(Boolean);

      case 'or({values})':
        return values.some(Boolean);

      case 'xor({values})':
        return values.filter(Boolean).length % 2 === 1;

      case 'array_join({values})':
        return nonNullValues.map(String).join(', ');

      case 'array_unique({values})':
        return [...new Set(nonNullValues.map(String))];

      case 'array_compact({values})':
        return nonNullValues;

      case 'concatenate({values})':
        return nonNullValues.map(String).join('');

      default:
        return null;
    }
  }
}
