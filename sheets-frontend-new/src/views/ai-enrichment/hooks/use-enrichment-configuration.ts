import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { encodeParams } from '@/services/url-params';
import { useEnrichmentParams } from '../use-enrichment-params';
import {
  FIELDS_PAYLOAD,
  BUSINESS_DISCOVERY_FIELDS_PAYLOAD,
  INFLUENCER_DISCOVERY_FIELDS_PAYLOAD,
  PEOPLE_SEARCH_FIELDS_PAYLOAD,
  FUNDING_DISCOVERY_FIELDS_PAYLOAD,
  AGENCY_DISCOVERY_FIELDS_PAYLOAD,
  HIRING_DISCOVERY_FIELDS_PAYLOAD,
  isDiscoveryType,
} from '../constants';
import type { ConfigFormHandle } from '../components/config-form';
import type { IcpFilterPanelHandle } from '../components/icp-filter-panel';
import useRequest from '@/hooks/useRequest';
import { extractErrorMessage } from '@/utils/error-message';
import { getDiscoveryJobStatus, getCreditBalance, DISCOVERY_CREDITS, discoverPeople, discoverFunding, discoverAgencies, discoverHiring } from '@/services/api';

interface ProspectItem {
  title: string;
  url: string;
  content: string;
}

function normalizeEnrichmentResponse(responseData: any): {
  items: ProspectItem[];
  previewData: any;
} {
  const previewData =
    responseData?.data || responseData?.item || responseData?.prospect || responseData || null;

  const itemsFromTopLevel = responseData?.items;
  const itemsFromNested = responseData?.data?.prospect?.items;
  const itemsFromProspect = responseData?.prospect?.items;
  const itemsFromItem = responseData?.item?.items;

  const itemsCandidate =
    itemsFromTopLevel || itemsFromNested || itemsFromProspect || itemsFromItem || [];

  return {
    items: Array.isArray(itemsCandidate) ? itemsCandidate : [],
    previewData,
  };
}

function normalizeDiscoveryResponse(responseData: any): Record<string, any>[] {
  const results =
    responseData?.results ||
    responseData?.data?.results ||
    responseData?.items ||
    responseData?.data?.items ||
    responseData?.data ||
    [];
  return Array.isArray(results) ? results : [];
}

const DISCOVERY_SHEET_TYPE_MAP: Record<string, 'business_discovery' | 'influencer_discovery'> = {
  businesses: 'business_discovery',
  influencers: 'influencer_discovery',
};

export interface DiscoveryProgress {
  found: number;
  target: number;
  complete: boolean;
}

export interface DiscoveryStats {
  duration?: number;
  queriesExecuted?: number;
  pagesSearched?: number;
  [key: string]: any;
}

export interface ConfigRef {
  saveAiConfigurationData: ConfigFormHandle['saveAiConfigurationData'] | null;
  data: any[];
  filterData: IcpFilterPanelHandle['filterData'];
}

const POLL_INTERVAL_MS = 3000;

export function useEnrichmentConfiguration(onTableNameError?: () => void) {
  const navigate = useNavigate();
  const { workspaceId, assetId: baseId } = useEnrichmentParams();

  const [activeStep, setActiveStep] = useState(0);
  const [previewTableData, setPreviewTableData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentDomain, setCurrentDomain] = useState('');
  const [currentType, setCurrentType] = useState('companies');
  const [lastSearchConfig, setLastSearchConfig] = useState<Record<string, any> | null>(null);
  const [tableName, setTableName] = useState('');
  const [tableNameError, setTableNameError] = useState(false);

  // ── Credit cost preview state ──
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditDialogConfig, setCreditDialogConfig] = useState<{
    totalItems: number;
    costPerItem: number;
    balance: number;
    itemLabel: string;
    actionLabel: string;
    onConfirm: (count: number) => void;
  } | null>(null);

  // ── Discovery polling state ──
  const [discoveryJobId, setDiscoveryJobId] = useState<string | null>(null);
  const [discoveryProgress, setDiscoveryProgress] = useState<DiscoveryProgress | null>(null);
  const [discoveryStats, setDiscoveryStats] = useState<DiscoveryStats | null>(null);
  const [isDiscoveryPolling, setIsDiscoveryPolling] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStoppedRef = useRef(false);

  // ── Existing ICP hooks ──
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

  // ── Discovery hooks ──
  const [{ loading: businessDiscoveryLoading }, triggerBusinessDiscovery] = useRequest(
    {
      method: 'post',
      url: '/table/discovery/business',
    },
    { manual: true }
  );

  const [{ loading: influencerDiscoveryLoading }, triggerInfluencerDiscovery] = useRequest(
    {
      method: 'post',
      url: '/table/discovery/influencer',
    },
    { manual: true }
  );

  const [{ loading: peopleDiscoveryLoading }, triggerPeopleDiscovery] = useRequest(
    {
      method: 'post',
      url: '/table/discovery/people',
    },
    { manual: true }
  );

  const [{ loading: fundingDiscoveryLoading }, triggerFundingDiscovery] = useRequest(
    {
      method: 'post',
      url: '/table/discovery/funding',
    },
    { manual: true }
  );

  const [{ loading: agencyDiscoveryLoading }, triggerAgencyDiscovery] = useRequest(
    {
      method: 'post',
      url: '/table/discovery/agencies',
    },
    { manual: true }
  );

  const [{ loading: hiringDiscoveryLoading }, triggerHiringDiscovery] = useRequest(
    {
      method: 'post',
      url: '/table/discovery/hiring',
    },
    { manual: true }
  );

  const [{ loading: createDiscoverySheetLoading }, triggerCreateDiscoverySheet] = useRequest(
    {
      method: 'post',
      url: '/sheet/create_discovery_sheet',
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

  // ── Derived loading states ──
  const discoverySearchLoading = businessDiscoveryLoading || influencerDiscoveryLoading || peopleDiscoveryLoading || fundingDiscoveryLoading || agencyDiscoveryLoading || hiringDiscoveryLoading || isDiscoveryPolling;
  const isDiscovery = isDiscoveryType(currentType);

  // ── ICP handlers (unchanged) ──
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
      const { items, previewData: normalizedPreviewData } = normalizeEnrichmentResponse(data);

      configRef.current.data = [formData];

      setPreviewTableData(items);
      setPreviewData(normalizedPreviewData);
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
      const { items, previewData: normalizedPreviewData } = normalizeEnrichmentResponse(data);
      setPreviewTableData(items);
      setPreviewData(normalizedPreviewData);
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

  // ── Discovery polling helpers ──
  const stopDiscoveryPolling = useCallback(() => {
    pollStoppedRef.current = true;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsDiscoveryPolling(false);
  }, []);

  const pollDiscoveryJob = useCallback(
    (jobId: string) => {
      if (pollStoppedRef.current) return;

      const tick = async () => {
        if (pollStoppedRef.current) return;
        try {
          const res = await getDiscoveryJobStatus(jobId);
          const job = res.data;

          if (pollStoppedRef.current) return;

          // Update results incrementally
          if (job.data && Array.isArray(job.data)) {
            setPreviewTableData(job.data);
          }

          // Update progress
          if (job.progress) {
            setDiscoveryProgress({
              found: job.progress.found,
              target: job.progress.target,
              complete: job.progress.complete,
            });
          }

          if (job.status === 'completed') {
            setDiscoveryStats(job.stats || null);
            setPreviewData(job);
            setIsDiscoveryPolling(false);
            setDiscoveryJobId(null);
            return; // stop polling
          }

          if (job.status === 'failed') {
            setIsDiscoveryPolling(false);
            setDiscoveryJobId(null);
            toast.error(job.error || 'Discovery failed');
            return; // stop polling
          }

          // Schedule next poll
          pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        } catch (err: any) {
          if (pollStoppedRef.current) return;
          console.error('Poll error:', err);
          // Retry on transient errors
          pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        }
      };

      // Start first poll after a short delay to let the job initialize
      pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    },
    [],
  );

  // ── Discovery execution (called after credit confirmation) ──
  const executeDiscoverySearch = async (formData: any, discoveryType: string) => {
    try {
      // Save FULL search config (with original limit) for background job when creating sheet
      const userRequestedLimit = formData.limit || 20;
      setLastSearchConfig({ ...formData, discoveryType, targetRecords: userRequestedLimit });

      // PREVIEW: always cap at 10 records (sync call)
      // The full target is used later when creating the sheet → background job
      const PREVIEW_LIMIT = 10;

      if (userRequestedLimit > PREVIEW_LIMIT) {
        toast.info(`Showing ${PREVIEW_LIMIT} preview records. All ${userRequestedLimit} will be populated after you create the table.`);
      }

      let res: any;

      if (discoveryType === 'businesses') {
        res = await triggerBusinessDiscovery({
          data: {
            query: formData.query,
            location: formData.location || undefined,
            country: formData.country || undefined,
            category: formData.category || undefined,
            limit: PREVIEW_LIMIT,
            baseId: baseId || undefined,
          },
        });
      } else if (discoveryType === 'influencers') {
        res = await triggerInfluencerDiscovery({
          data: {
            platform: formData.platform,
            query: formData.query,
            minFollowers: formData.minFollowers || 1000,
            limit: PREVIEW_LIMIT,
            country: formData.country || undefined,
            baseId: baseId || undefined,
          },
        });
      } else if (discoveryType === 'people_search') {
        res = await triggerPeopleDiscovery({
          data: {
            jobTitle: formData.jobTitle || undefined,
            company: formData.company || undefined,
            location: formData.location || undefined,
            seniority: formData.seniority || undefined,
            skills: formData.skills || undefined,
            industry: formData.industry || undefined,
            education: formData.education || undefined,
            limit: PREVIEW_LIMIT,
            baseId: baseId || undefined,
          },
        });
      } else if (discoveryType === 'funding') {
        res = await triggerFundingDiscovery({
          data: {
            industry: formData.industry || undefined,
            round: formData.round || undefined,
            location: formData.location || undefined,
            timeframe: formData.timeframe || undefined,
            limit: PREVIEW_LIMIT,
            baseId: baseId || undefined,
          },
        });
      } else if (discoveryType === 'agencies') {
        res = await triggerAgencyDiscovery({
          data: {
            serviceType: formData.serviceType,
            location: formData.location || undefined,
            industry: formData.industry || undefined,
            limit: PREVIEW_LIMIT,
            baseId: baseId || undefined,
          },
        });
      } else if (discoveryType === 'hiring') {
        res = await triggerHiringDiscovery({
          data: {
            tools: formData.tools || undefined,
            role: formData.role || undefined,
            location: formData.location || undefined,
            industry: formData.industry || undefined,
            limit: PREVIEW_LIMIT,
            baseId: baseId || undefined,
          },
        });
      }

      const data = (res as any)?.data;

      // Preview is always sync (capped at 10 records)
      // Background job for the full target happens after "Create Table"
      const items = normalizeDiscoveryResponse(data);
      setPreviewTableData(items);
      setPreviewData(data);
      if (tableNameError) {
        setTableNameError(false);
      }
      setActiveStep(1);
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Failed to search');
      toast.error(message);
    }
  };

  // ── Discovery handlers (with credit preview) ──
  const handleDiscoverySearch = async () => {
    if (!configRef.current.saveAiConfigurationData) return;
    try {
      const formData = await configRef.current.saveAiConfigurationData();
      const discoveryType = formData.type.value;
      const costPerItem = DISCOVERY_CREDITS[discoveryType] || 20;

      // Fetch credit balance
      let balance = Infinity;
      if (baseId) {
        try {
          const res = await getCreditBalance(baseId);
          balance = res.balance;
        } catch {
          // If balance check fails, proceed without dialog
        }
      }

      if (balance === Infinity || balance >= costPerItem) {
        // Enough credits or no credit service — proceed directly
        if (balance !== Infinity && balance < costPerItem) {
          toast.error(`Insufficient credits: need ${costPerItem}, have ${balance}. Upgrade your plan.`);
          return;
        }
        await executeDiscoverySearch(formData, discoveryType);
        return;
      }

      // Not enough credits — show dialog
      toast.error(`Insufficient credits: need ${costPerItem} credits for ${discoveryType} discovery, have ${balance}. Please upgrade your plan.`);
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Failed to search');
      toast.error(message);
    }
  };

  const handleStopDiscovery = useCallback(() => {
    stopDiscoveryPolling();
    setDiscoveryProgress((prev) => (prev ? { ...prev, complete: true } : prev));
    toast.info('Discovery stopped');
  }, [stopDiscoveryPolling]);

  const handleCreateDiscoveryTable = async () => {
    try {
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

      const fieldsPayloadMap: Record<string, typeof BUSINESS_DISCOVERY_FIELDS_PAYLOAD> = {
        businesses: BUSINESS_DISCOVERY_FIELDS_PAYLOAD,
        influencers: INFLUENCER_DISCOVERY_FIELDS_PAYLOAD,
        people_search: PEOPLE_SEARCH_FIELDS_PAYLOAD,
        funding: FUNDING_DISCOVERY_FIELDS_PAYLOAD,
        agencies: AGENCY_DISCOVERY_FIELDS_PAYLOAD,
        hiring: HIRING_DISCOVERY_FIELDS_PAYLOAD,
      };
      const fieldsPayload = fieldsPayloadMap[currentType] || BUSINESS_DISCOVERY_FIELDS_PAYLOAD;

      const discoveryTypeForSheet =
        DISCOVERY_SHEET_TYPE_MAP[currentType] ?? 'influencer_discovery';

      // Pass search_params so the backend can trigger a background job
      // to find MORE records beyond the 10 preview records
      // targetRecords is the FULL user-requested count (e.g., 99), not the preview limit (10)
      const searchParams = lastSearchConfig || {};
      const targetCount = searchParams.targetRecords || searchParams.limit || 100;

      const res = await triggerCreateDiscoverySheet({
        data: {
          discovery_type: discoveryTypeForSheet,
          fields_payload: fieldsPayload,
          records: previewTableData,
          workspace_id: workspaceId || undefined,
          asset_name: trimmedName,
          table_name: trimmedName,
          search_params: searchParams,
          target_records: targetCount,
        },
      });

      const result = (res as any)?.data;
      const base = result?.base || result?.data?.base;
      const table = result?.table || result?.data?.table;
      const view = result?.view || result?.data?.view;

      if (base?.id && table?.id) {
        const encoded = encodeParams({ a: base.id, t: table.id, v: view?.id || '' });
        toast.success('Discovery Table created successfully!');
        navigate(`/?q=${encoded}`);
      } else {
        toast.error('Table created but could not navigate. Check your tables.');
      }
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Failed to create table');
      toast.error(message);
    }
  };

  // ── Unified handlers ──
  const handleContinueClick = () => {
    if (activeStep === 0) {
      if (isDiscoveryType(currentType)) {
        handleDiscoverySearch();
      } else {
        handleGetPreviewData();
      }
    } else {
      if (isDiscoveryType(currentType)) {
        handleCreateDiscoveryTable();
      } else {
        handleCreateEnrichmentTable();
      }
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
    currentType,
    setCurrentType,
    tableName,
    setTableName,
    tableNameError,
    setTableNameError,
    getPreviewDataLoading: isDiscovery ? discoverySearchLoading : getPreviewDataLoading,
    getProspectDataLoading,
    createTableLoading: isDiscovery ? createDiscoverySheetLoading : createTableLoading,
    discoverySearchLoading,
    createDiscoverySheetLoading,
    configRef,
    handleContinueClick,
    handleGetSyncData,
    handleBack,
    // Discovery polling
    discoveryJobId,
    discoveryProgress,
    discoveryStats,
    isDiscoveryPolling,
    handleStopDiscovery,
    // Credit cost preview
    creditDialogOpen,
    setCreditDialogOpen,
    creditDialogConfig,
  };
}
