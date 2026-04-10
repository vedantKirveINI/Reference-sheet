import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SheetService } from './sheet.service';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import {
  createFormSheetScehma,
  createFormSheetScehmeDTO,
} from './DTO/create-form-sheet.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  updateFormSheetFieldsDTO,
  updateFormSheetFieldsSchema,
} from './DTO/update-form-sheet-fields.dto';
import { GetSheetDTO, GetSheetSchema } from './DTO/get-sheet.dto';
import { Request } from 'express';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { OperationType } from 'src/common/enums/operation-type.enum';
import {
  PermissionResult,
  RolePermissionGuard,
} from 'src/guards/role-permission.guard';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import {
  CreateAiEnrichmentSheetDTO,
  createAiEnrichmentSheetSchema,
} from './DTO/create-ai-enrichment-sheet.dto';
import {
  CreateDiscoverySheetDTO,
  createDiscoverySheetSchema,
} from './DTO/create-discovery-sheet.dto';
import { CreateSheetDTO, createSheetSchema } from './DTO/create-sheet.dto';

@Controller('sheet')
export class SheetController {
  constructor(
    private sheetService: SheetService,
    private prisma: PrismaService,
    private emitter: EventEmitterService,
  ) {}

  @Post('/create_sheet')
  async createSheet(
    @Body(new ZodValidationPipe(createSheetSchema))
    createSheetPayload: CreateSheetDTO,
    @Req() request: Request,
    @Headers() headers: any,
  ) {
    const { token } = headers;
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.sheetService.createSheet(
        createSheetPayload,
        prisma,
        request,
        token,
      );
    });
  }

  @Post('/create_form_sheet')
  async createFormSheet(
    @Body(new ZodValidationPipe(createFormSheetScehma))
    createFormSheetPayload: createFormSheetScehmeDTO,
    @Req() request: Request,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.sheetService.createFormSheet(
        createFormSheetPayload,
        prisma,
        request,
      );
    });
  }

  @Post('/update_form_sheet')
  async updateFormSheet(
    @Body(new ZodValidationPipe(updateFormSheetFieldsSchema))
    updateFormSheetPayload: updateFormSheetFieldsDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.sheetService.updateFormSheetFields(
        updateFormSheetPayload,
        prisma,
        token,
        true,
      );
    });
  }

  @Get('get_sheets')
  async getSheets(@Query('spaceId') spaceId: string) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.sheetService.getSheets(spaceId, prisma);
    });
  }

  @Post('get_sheet')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getSheet(
    @Body(new ZodValidationPipe(GetSheetSchema)) getSheetPayload: GetSheetDTO,
    @Headers() headers: any,
    @Req() request: Request,
  ) {
    const { token } = headers;
    // Access user permissions from request object
    const userPermissions = request.userPermissions as PermissionResult;

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.sheetService.getSheet(
        getSheetPayload,
        prisma,
        token,
        userPermissions,
      );
    });
  }

  // Add this method to the SheetController class
  @Post('/create_ai_enrichment_sheet')
  async createAiEnrichmentSheet(
    @Body(new ZodValidationPipe(createAiEnrichmentSheetSchema))
    createAiEnrichmentSheetPayload: CreateAiEnrichmentSheetDTO,
    @Req() request: Request,
    @Headers() headers: any,
  ) {
    const { token } = headers;
    const { records } = createAiEnrichmentSheetPayload;

    const response = await this.prisma.prismaClient.$transaction(
      async (prisma) => {
        return await this.sheetService.createAiEnrichmentSheet(
          createAiEnrichmentSheetPayload,
          prisma,
          request,
          token,
        );
      },
    );

    const { fields, table, view, base } = response;

    //   hit ankits apis
    const prospect_inputs = {
      ...createAiEnrichmentSheetPayload.prospect_inputs,
    };

    const meta = {
      tableId: table.id,
      baseId: base.id,
      viewId: view.id,
      fields: fields,
    };

    prospect_inputs.meta = meta;
    prospect_inputs.webhook_url = `${process.env.BASE_URL}/table/v1/webhook/prospect-data`;
    prospect_inputs.mode = 'from_product';
    prospect_inputs.initial_sent_results = records?.map(
      (record) => record?.url,
    );

    await this.emitter.emitAsync(
      'table.runProspect',
      prospect_inputs,
      false, // sync: false
    );

    return response;
  }

  @Post('/create_discovery_sheet')
  async createDiscoverySheet(
    @Body(new ZodValidationPipe(createDiscoverySheetSchema))
    createDiscoverySheetPayload: CreateDiscoverySheetDTO,
    @Req() request: Request,
    @Headers() headers: any,
  ) {
    const { token } = headers;
    const response = await this.prisma.prismaClient.$transaction(
      async (prisma) => {
        return await this.sheetService.createDiscoverySheet(
          createDiscoverySheetPayload,
          prisma,
          request,
          token,
        );
      },
    );

    const { fields, table, view, base } = response;

    // Build discovery inputs for background job
    const discoveryInputs = {
      discovery_type: createDiscoverySheetPayload.discovery_type,
      ...createDiscoverySheetPayload.search_params || {},
      meta: {
        tableId: table.id,
        baseId: base.id,
        viewId: view.id,
        fields: fields,
      },
      webhook_url: `${process.env.BASE_URL}/table/v1/webhook/discovery-data`,
      initial_sent_results: (createDiscoverySheetPayload.records || []).map(
        (r: any) => {
          // For influencers: handle is the unique dedup key in the enrichment engine
          // For businesses: name is the best available key (placeId not stored on UI)
          const key = createDiscoverySheetPayload.discovery_type === 'influencer_discovery'
            ? (r.handle || r.name || '')
            : (r.name || r.company || '');
          return typeof key === 'string' ? key.toLowerCase() : '';
        },
      ).filter(Boolean),
      targetRecords: Math.max(
        0,
        (createDiscoverySheetPayload.target_records || 100) - (createDiscoverySheetPayload.records || []).length,
      ),
    };

    // Fire and forget — don't await
    this.emitter.emitAsync('table.runDiscovery', discoveryInputs, false);

    return response;
  }
}
