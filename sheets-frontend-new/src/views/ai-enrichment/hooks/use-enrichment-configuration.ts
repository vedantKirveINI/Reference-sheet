import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { encodeParams } from '@/services/url-params';
import { useEnrichmentParams } from '../use-enrichment-params';
import { FIELDS_PAYLOAD } from '../constants';
import type { ConfigFormHandle } from '../components/config-form';
import type { IcpFilterPanelHandle } from '../components/icp-filter-panel';
import useRequest from '@/hooks/useRequest';
import { extractErrorMessage } from '@/utils/error-message';

interface ProspectItem {
  title: string;
  url: string;
  content: string;
}

export interface ConfigRef {
  saveAiConfigurationData: ConfigFormHandle['saveAiConfigurationData'] | null;
  data: any[];
  filterData: IcpFilterPanelHandle['filterData'];
}

export function useEnrichmentConfiguration(onTableNameError?: () => void) {
  const navigate = useNavigate();
  const { workspaceId } = useEnrichmentParams();

  const [activeStep, setActiveStep] = useState(0);
  const [previewTableData, setPreviewTableData] = useState<ProspectItem[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentDomain, setCurrentDomain] = useState('');
  const [currentType, setCurrentType] = useState('companies');
  const [tableName, setTableName] = useState('');
  const [tableNameError, setTableNameError] = useState(false);

  const [{ loading: getPreviewDataLoading }, triggerPreview] = useRequest(
    {
      method: 'post',
      url: '/table/icp-prospect/process',
    },
    { manual: true }
  );

  const [{ loading: getProspectDataLoading }, triggerProspect] = useRequest(
    {
      method: 'post',
      url: '/table/prospect/run',
      params: { sync: true },
    },
    { manual: true }
  );

  const [{ loading: createTableLoading }, triggerCreateSheet] = useRequest(
    {
      method: 'post',
      url: '/sheet/create_ai_enrichment_sheet',
    },
    { manual: true }
  );

  const configRef = useRef<ConfigRef>({
    saveAiConfigurationData: null,
    data: [],
    filterData: {
      icpFilter: null,
      locationFilter: null,
      limitFilter: null,
    },
  });

  const handleGetPreviewData = async () => {
    if (!configRef.current.saveAiConfigurationData) return;
    try {
      const formData = await configRef.current.saveAiConfigurationData();
      const { type, url, industries, geographies } = formData;
      setCurrentDomain(url);
      setCurrentType(type.value);

      const payload = {
        prospect_inputs: {
          domain: url,
          prospecting_target: type.value,
        },
        icp_inputs: { domain: url },
        override_icp: { industries, geographies },
        workspace_id: workspaceId || undefined,
      };

      const res = await triggerPreview({ data: payload });
      const data = (res as any)?.data;

      configRef.current.data = [formData];

      const items: ProspectItem[] = data?.data?.prospect?.items || [];
      setPreviewTableData(items);
      setPreviewData(data?.data || null);
      // entering Step 2: clear any previous sheet-name error
      if (tableNameError) {
        setTableNameError(false);
      }
      setActiveStep(1);
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Failed to search profiles');
      toast.error(message);
    }
  };

  const handleGetSyncData = async () => {
    try {
      const { icpFilter, locationFilter } = configRef.current.filterData;

      const [icpFilterData, locationFilterData] = await Promise.all([
        icpFilter ? icpFilter.getFilterData() : Promise.resolve({}),
        locationFilter ? locationFilter.getFilterData() : Promise.resolve({}),
      ]);

      const normalizedIcp: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(icpFilterData as Record<string, any[]>)) {
        normalizedIcp[key] = (value || []).map((v) => v.value);
      }

      const normalizedLocation: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(locationFilterData as Record<string, string[]>)) {
        if (Array.isArray(value) && value.length > 0) {
          normalizedLocation[key] = value;
        }
      }

      const res = await triggerProspect({
        data: {
          domain: currentDomain,
          prospecting_target: currentType,
          override_icp: { ...normalizedIcp, ...normalizedLocation },
          workspace_id: workspaceId || undefined,
        },
      });

      const data = (res as any)?.data;
      const items: ProspectItem[] = data?.data?.prospect?.items || [];
      setPreviewTableData(items);
      toast.success('Data refreshed successfully');
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Failed to refetch data');
      toast.error(message);
    }
  };

  const handleCreateEnrichmentTable = async () => {
    try {
      const { limitFilter } = configRef.current.filterData;
      const limitStr = limitFilter ? await limitFilter.getLimitData() : '100';
      const targetCount = Number(limitStr) || 100;

      const trimmedName = tableName.trim();
      if (!trimmedName) {
        setTableNameError(true);
        toast.error('Please enter a sheet name before creating the table.');
        onTableNameError?.();
        return;
      }
      if (tableNameError) {
        setTableNameError(false);
      }

      const res = await triggerCreateSheet({
        data: {
          prospect_inputs: {
            domain: currentDomain,
            prospecting_target: currentType,
            output: { target_count: targetCount },
          },
          icp_inputs: { domain: currentDomain },
          fields_payload: FIELDS_PAYLOAD,
          records: previewTableData,
          workspace_id: workspaceId || undefined,
          asset_name: trimmedName,
          table_name: trimmedName,
        },
      });

      const result = (res as any)?.data;
      const base = result?.base || result?.data?.base;
      const table = result?.table || result?.data?.table;
      const view = result?.view || result?.data?.view;

      if (base?.id && table?.id) {
        const encoded = encodeParams({ a: base.id, t: table.id, v: view?.id || '' });
        toast.success('AI Enrichment Table created successfully!');
        navigate(`/?q=${encoded}`);
      } else {
        toast.error('Table created but could not navigate. Check your tables.');
      }
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Failed to create table');
      toast.error(message);
    }
  };

  const handleContinueClick = () => {
    if (activeStep === 0) {
      handleGetPreviewData();
    } else {
      handleCreateEnrichmentTable();
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  return {
    activeStep,
    previewTableData,
    previewData,
    currentDomain,
    setCurrentDomain,
    tableName,
    setTableName,
    tableNameError,
    setTableNameError,
    getPreviewDataLoading,
    getProspectDataLoading,
    createTableLoading,
    configRef,
    handleContinueClick,
    handleGetSyncData,
    handleBack,
  };
}
