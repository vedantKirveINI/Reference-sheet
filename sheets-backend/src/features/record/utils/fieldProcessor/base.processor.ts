import { LoDashStatic } from 'lodash';

export abstract class BaseFieldProcessor {
  protected field: any;
  protected fieldInfo: any;
  protected tableId: string;
  protected baseId: string;
  protected viewId: string;

  protected emitter: any;
  protected prisma: any;
  protected lodash: LoDashStatic;

  public updateFieldPayload: Record<string, any> = {};
  public recordData: Record<string, any> = {};
  public normalizedData: any;

  constructor(params: {
    field: any;
    fieldInfo: any;
    tableId: string;
    baseId: string;
    viewId: string;
    emitter: any;
    prisma: any;
    lodash: LoDashStatic; // ✅ Pass it explicitly
  }) {
    this.field = params.field;
    this.fieldInfo = params.fieldInfo;
    this.tableId = params.tableId;
    this.baseId = params.baseId;
    this.viewId = params.viewId;
    this.emitter = params.emitter;
    this.prisma = params.prisma;
    this.lodash = params.lodash;
  }

  abstract normalizeData(): any;
  abstract getMissingOptions(currentOptions: any): any[];
  abstract getUpdatedOptions(currentOptions: any, missingValues: any): any;

  protected async updateField(): Promise<void> {
    if (!this.lodash.isEmpty(this.updateFieldPayload)) {
      await this.emitter.emitAsync(
        'field.updateField',
        this.updateFieldPayload,
        this.prisma,
      );
    }
  }

  protected prepareUpdateFieldPayload(updatedOptions: any): void {
    this.updateFieldPayload = {
      id: this.field.id,
      tableId: this.tableId,
      viewId: this.viewId,
      baseId: this.baseId,
      options: updatedOptions,
    };
  }

  abstract process(): Promise<void>;
}
