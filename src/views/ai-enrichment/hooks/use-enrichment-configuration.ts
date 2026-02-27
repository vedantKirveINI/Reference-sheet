import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  icpProspectProcess,
  prospectRun,
  createAiEnrichmentSheet,
} from '@/services/api';
import { encodeParams } from '@/services/url-params';
import { useEnrichmentParams } from '../use-enrichment-params';
import { FIELDS_PAYLOAD } from '../constants';
import type { ConfigFormHandle } from '../components/config-form';
import type { IcpFilterPanelHandle } from '../components/icp-filter-panel';

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

export function useEnrichmentConfiguration() {
  const navigate = useNavigate();
  const { workspaceId } = useEnrichmentParams();

  const [activeStep, setActiveStep] = useState(0);
  const [previewTableData, setPreviewTableData] = useState<ProspectItem[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentDomain, setCurrentDomain] = useState('');
  const [currentType, setCurrentType] = useState('companies');

  const [getPreviewDataLoading, setGetPreviewDataLoading] = useState(false);
  const [getProspectDataLoading, setGetProspectDataLoading] = useState(false);
  const [createTableLoading, setCreateTableLoading] = useState(false);

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
    setGetPreviewDataLoading(true);
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

      const res = await icpProspectProcess(payload);
      const data = res.data;

      configRef.current.data = [formData];

      const items: ProspectItem[] = data?.data?.prospect?.items || [];
      setPreviewTableData(items);
      setPreviewData(data?.data || null);
      setActiveStep(1);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to search profiles';
      toast.error(message.length > 100 ? message.slice(0, 100) + '...' : message);
    } finally {
      setGetPreviewDataLoading(false);
    }
  };

  const handleGetSyncData = async () => {
    setGetProspectDataLoading(true);
    try {
      const { icpFilter, locationFilter } = configRef.current.filterData;

      const [icpFilterData, locationFilterData] = await Promise.all([
        icpFilter ? icpFilter.getFilterData() : Promise.resolve({}),
        locationFilter ? locationFilter.getFilterData() : Promise.resolve({}),
      ]);

      const normalizedIcp: Record<string, string[]> = {};
      for (const [key, values] of Object.entries(icpFilterData)) {
        normalizedIcp[key] = values.map((v) => v.value);
      }

      const normalizedLocation: Record<string, string[]> = {};
      for (const [key, values] of Object.entries(locationFilterData as Record<string, string[]>)) {
        if (Array.isArray(values) && values.length > 0) {
          normalizedLocation[key] = values;
        }
      }

      const res = await prospectRun({
        domain: currentDomain,
        prospecting_target: currentType,
        override_icp: { ...normalizedIcp, ...normalizedLocation },
        workspace_id: workspaceId || undefined,
      });

      const items: ProspectItem[] = res.data?.data?.prospect?.items || [];
      setPreviewTableData(items);
      toast.success('Data refreshed successfully');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to refetch data';
      toast.error(message.length > 100 ? message.slice(0, 100) + '...' : message);
    } finally {
      setGetProspectDataLoading(false);
    }
  };

  const handleCreateEnrichmentTable = async () => {
    setCreateTableLoading(true);
    try {
      const { limitFilter } = configRef.current.filterData;
      const limitStr = limitFilter ? await limitFilter.getLimitData() : '100';
      const targetCount = Number(limitStr) || 100;

      const res = await createAiEnrichmentSheet({
        prospect_inputs: {
          domain: currentDomain,
          prospecting_target: currentType,
          output: { target_count: targetCount },
        },
        icp_inputs: { domain: currentDomain },
        fields_payload: FIELDS_PAYLOAD,
        records: previewTableData,
        workspace_id: workspaceId || undefined,
      });

      const result = res.data;
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
      const message =
        err?.response?.data?.message || err?.message || 'Failed to create table';
      toast.error(message.length > 100 ? message.slice(0, 100) + '...' : message);
    } finally {
      setCreateTableLoading(false);
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
    getPreviewDataLoading,
    getProspectDataLoading,
    createTableLoading,
    configRef,
    handleContinueClick,
    handleGetSyncData,
    handleBack,
  };
}
