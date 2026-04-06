import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Building2, Users, TrendingUp, Search, Table2, FileText } from 'lucide-react';
import { EnrichmentStepper } from './components/enrichment-stepper';
import { ConfigForm, type ConfigFormHandle } from './components/config-form';
import { IcpFilterPanel, type IcpFilterPanelHandle } from './components/icp-filter-panel';
import { DiscoveryPreviewPanel } from './components/discovery-preview-panel';
import { PreviewTable } from './components/preview-table';
import { EnrichmentSkeleton } from './components/enrichment-skeleton';
import { useEnrichmentConfiguration } from './hooks/use-enrichment-configuration';
import { useEnrichmentParams } from './use-enrichment-params';
import {
  STEPS,
  DISCOVERY_STEPS,
  BUSINESS_PREVIEW_FIELDS,
  INFLUENCER_PREVIEW_FIELDS,
  PEOPLE_PREVIEW_FIELDS,
  FUNDING_PREVIEW_FIELDS,
  AGENCY_PREVIEW_FIELDS,
  HIRING_PREVIEW_FIELDS,
  isDiscoveryType,
} from './constants';
import { companyProspectPreviewData } from './dummy-data';

function getTitle(aiOption: string): string {
  if (aiOption === 'people') return 'Find Customers — People';
  if (aiOption === 'competitors') return 'Find Competitors — Company';
  if (aiOption === 'businesses') return 'Discover Businesses';
  if (aiOption === 'influencers') return 'Discover Influencers';
  if (aiOption === 'people_search') return 'Discover People';
  if (aiOption === 'funding') return 'Discover Funded Startups';
  if (aiOption === 'agencies') return 'Discover Agencies';
  if (aiOption === 'hiring') return 'Discover Hiring Signals';
  return 'Find Customers — Company';
}

function getDescription(aiOption: string): string {
  if (aiOption === 'people') {
    return 'Identify key decision makers and contacts that match your Ideal Customer Profile using AI intelligence. (20 credits / record)';
  }
  if (aiOption === 'competitors') {
    return 'Discover competitors and similar businesses to understand your competitive landscape and positioning. (10 credits / record)';
  }
  if (aiOption === 'businesses') {
    return 'Search and discover businesses by type, location, and category. Build a targeted list in seconds. (20 credits / search)';
  }
  if (aiOption === 'influencers') {
    return 'Find influencers by niche, platform, and follower count. Build your outreach list with AI. (20 credits / search)';
  }
  if (aiOption === 'people_search') {
    return 'Find professionals by title, company, skills, and seniority. Build targeted prospect lists. (20 credits / search)';
  }
  if (aiOption === 'funding') {
    return 'Find recently funded companies by industry, round, and geography. Target companies with budget. (20 credits / search)';
  }
  if (aiOption === 'agencies') {
    return 'Find top-rated agencies by service type and location. Source from Clutch, G2, and Google Maps. (20 credits / search)';
  }
  if (aiOption === 'hiring') {
    return 'Find companies actively hiring for specific tools or roles. The strongest buying signal. (20 credits / search)';
  }
  return 'Enter a company domain and let AI discover similar businesses that are your best-fit customers. (10 credits / record)';
}

function getPreviewTitle(aiOption: string): string {
  if (aiOption === 'businesses') return 'Business Discovery Preview';
  if (aiOption === 'influencers') return 'Influencer Discovery Preview';
  if (aiOption === 'people_search') return 'People Discovery Preview';
  if (aiOption === 'funding') return 'Funding Discovery Preview';
  if (aiOption === 'agencies') return 'Agency Discovery Preview';
  if (aiOption === 'hiring') return 'Hiring Signals Preview';
  return 'Ideal Customer Profile Preview';
}

function getPreviewDescription(loading: boolean, step: number, aiOption: string): string {
  if (aiOption === 'businesses') {
    if (loading) return 'Searching for businesses matching your criteria. This only takes a moment.';
    if (step === 0) return 'Configure your search and click Search to discover businesses.';
    return 'Businesses matching your search — review the results and create your table.';
  }
  if (aiOption === 'influencers') {
    if (loading) return 'Searching for influencers matching your criteria. This only takes a moment.';
    if (step === 0) return 'Configure your search and click Search to discover influencers.';
    return 'Influencers matching your search — review the results and create your table.';
  }
  if (aiOption === 'people_search') {
    if (loading) return 'Searching for people matching your criteria. This only takes a moment.';
    if (step === 0) return 'Configure your search and click Search to discover people.';
    return 'People matching your search — review the results and create your table.';
  }
  if (aiOption === 'funding') {
    if (loading) return 'Searching for funded startups matching your criteria. This only takes a moment.';
    if (step === 0) return 'Configure your search and click Search to discover funded startups.';
    return 'Funded startups matching your search — review the results and create your table.';
  }
  if (aiOption === 'agencies') {
    if (loading) return 'Searching for agencies matching your criteria. This only takes a moment.';
    if (step === 0) return 'Configure your search and click Search to discover agencies.';
    return 'Agencies matching your search — review the results and create your table.';
  }
  if (aiOption === 'hiring') {
    if (loading) return 'Searching for hiring signals matching your criteria. This only takes a moment.';
    if (step === 0) return 'Configure your search and click Search to discover hiring signals.';
    return 'Companies with hiring signals matching your search — review the results and create your table.';
  }
  if (loading) {
    return 'AI is scanning millions of companies to find your best-fit customers. Sit tight — this only takes a moment.';
  }
  if (step === 0) {
    return 'Sample records showing what your results will look like. Fill the form and search to see real matches.';
  }
  return 'Real companies matching your ICP — refine the filters on the left to narrow down your list.';
}

function getHeaderIcon(aiOption: string) {
  if (aiOption === 'people') return <Users className="h-4.5 w-4.5 text-white" />;
  if (aiOption === 'competitors') return <TrendingUp className="h-4.5 w-4.5 text-white" />;
  if (aiOption === 'businesses') return <Building2 className="h-4 w-4 text-white" />;
  if (aiOption === 'influencers') return <Users className="h-4.5 w-4.5 text-white" />;
  if (aiOption === 'people_search') return <Users className="h-4.5 w-4.5 text-white" />;
  if (aiOption === 'funding') return <TrendingUp className="h-4.5 w-4.5 text-white" />;
  if (aiOption === 'agencies') return <Building2 className="h-4 w-4 text-white" />;
  if (aiOption === 'hiring') return <Search className="h-4 w-4 text-white" />;
  return <Building2 className="h-4 w-4 text-white" />;
}

function getDiscoveryPreviewColumns(type: string) {
  const fieldsMap: Record<string, string[]> = {
    businesses: BUSINESS_PREVIEW_FIELDS,
    influencers: INFLUENCER_PREVIEW_FIELDS,
    people_search: PEOPLE_PREVIEW_FIELDS,
    funding: FUNDING_PREVIEW_FIELDS,
    agencies: AGENCY_PREVIEW_FIELDS,
    hiring: HIRING_PREVIEW_FIELDS,
  };
  const fields = fieldsMap[type] || BUSINESS_PREVIEW_FIELDS;
  const keyMap: Record<string, string> = {
    'Name': 'name',
    'Address': 'address',
    'Phone': 'phone',
    'Website': 'website',
    'Rating': 'rating',
    'Handle': 'handle',
    'Followers': 'followers',
    'Bio': 'bio',
    'Profile URL': 'profileUrl',
    'Title': 'title',
    'Company': 'company',
    'Location': 'location',
    'Seniority': 'seniority',
    'Round': 'round',
    'Amount': 'amount',
    'Industry': 'industry',
    'Services': 'services',
    'Reviews': 'reviewCount',
    'Tools': 'tools_mentioned',
    'Signal': 'signal_strength',
    'Roles': 'roles',
    'Department': 'department',
  };
  return fields.map((f) => ({ label: f, key: keyMap[f] || f.toLowerCase() }));
}

export function AiEnrichmentPage() {
  const navigate = useNavigate();
  const { aiOption } = useEnrichmentParams();

  const configFormRef = useRef<ConfigFormHandle>(null);
  const icpFilterPanelRef = useRef<IcpFilterPanelHandle>(null);
  const discoveryPreviewRef = useRef<{ scrollSheetNameIntoView: () => void }>(null);

  // Track the *live* type from the form (may differ from URL param while user switches)
  const [liveType, setLiveType] = useState(aiOption);

  const {
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
    getPreviewDataLoading,
    getProspectDataLoading,
    createTableLoading,
    configRef,
    handleContinueClick,
    handleGetSyncData,
    handleBack,
    discoveryProgress,
    discoveryStats,
    isDiscoveryPolling,
    handleStopDiscovery,
  } = useEnrichmentConfiguration(() => {
    if (isDiscoveryType(liveType)) {
      discoveryPreviewRef.current?.scrollSheetNameIntoView();
    } else {
      icpFilterPanelRef.current?.scrollSheetNameIntoView();
    }
  });

  const isDiscovery = isDiscoveryType(liveType);
  const steps = isDiscovery ? DISCOVERY_STEPS : STEPS;

  const handleTypeChange = (type: string) => {
    setLiveType(type);
    setCurrentType(type);
  };

  // ── Step content ──
  const icpStepContent: React.ReactNode[] = [
    <ConfigForm
      key="config-form"
      ref={(r) => {
        (configFormRef as any).current = r;
        if (r) configRef.current.saveAiConfigurationData = r.saveAiConfigurationData;
      }}
      loading={getPreviewDataLoading}
      onDomainChange={setCurrentDomain}
      onTypeChange={handleTypeChange}
    />,
    <IcpFilterPanel
      key="icp-filter-panel"
      ref={(r) => {
        (icpFilterPanelRef as any).current = r;
        if (r) configRef.current.filterData = r.filterData;
      }}
      data={previewData}
      tableName={tableName}
      tableNameError={tableNameError}
      onTableNameChange={(value) => {
        setTableName(value);
        if (tableNameError && value.trim()) {
          setTableNameError(false);
        }
      }}
    />,
  ];

  const discoveryStepContent: React.ReactNode[] = [
    <ConfigForm
      key="config-form"
      ref={(r) => {
        (configFormRef as any).current = r;
        if (r) configRef.current.saveAiConfigurationData = r.saveAiConfigurationData;
      }}
      loading={getPreviewDataLoading}
      onDomainChange={setCurrentDomain}
      onTypeChange={handleTypeChange}
    />,
    <DiscoveryPreviewPanel
      key="discovery-preview-panel"
      ref={discoveryPreviewRef}
      tableName={tableName}
      tableNameError={tableNameError}
      onTableNameChange={(value) => {
        setTableName(value);
        if (tableNameError && value.trim()) {
          setTableNameError(false);
        }
      }}
      recordCount={previewTableData?.length ?? 0}
    />,
  ];

  const stepContent = isDiscovery ? discoveryStepContent : icpStepContent;

  // ── Step actions ──
  const icpStepActions = [
    [
      {
        label: 'Search Ideal Customer Profiles',
        variant: 'primary' as const,
        onClick: handleContinueClick,
        loading: getPreviewDataLoading,
        disabled: getPreviewDataLoading,
      },
    ],
    [
      {
        label: 'Refetch',
        variant: 'outline' as const,
        onClick: handleGetSyncData,
        loading: getProspectDataLoading,
        disabled: getProspectDataLoading || createTableLoading,
      },
      {
        label: 'Back',
        variant: 'outline' as const,
        onClick: handleBack,
        disabled: createTableLoading,
      },
      {
        label: 'Create Table',
        variant: 'primary' as const,
        onClick: handleContinueClick,
        loading: createTableLoading,
        disabled:
          createTableLoading ||
          getProspectDataLoading ||
          !previewTableData ||
          previewTableData.length === 0,
      },
    ],
  ];

  const discoveryStepActions = [
    [
      {
        label: ({
          businesses: 'Search Businesses',
          influencers: 'Search Influencers',
          people_search: 'Search People',
          funding: 'Search Funded Startups',
          agencies: 'Search Agencies',
          hiring: 'Search Hiring Signals',
        } as Record<string, string>)[liveType] || 'Search',
        variant: 'primary' as const,
        onClick: handleContinueClick,
        loading: getPreviewDataLoading,
        disabled: getPreviewDataLoading,
      },
    ],
    [
      ...(isDiscoveryPolling
        ? [
            {
              label: 'Stop',
              variant: 'outline' as const,
              onClick: handleStopDiscovery,
              disabled: false,
            },
          ]
        : [
            {
              label: 'Back',
              variant: 'outline' as const,
              onClick: handleBack,
              disabled: createTableLoading,
            },
          ]),
      {
        label: 'Create Table',
        variant: 'primary' as const,
        onClick: handleContinueClick,
        loading: createTableLoading,
        disabled:
          createTableLoading ||
          isDiscoveryPolling ||
          !previewTableData ||
          previewTableData.length === 0,
      },
    ],
  ];

  const stepActions = isDiscovery ? discoveryStepActions : icpStepActions;

  const discoveryStepPreviews = [
    null,
    {
      headline: 'Review results & create table',
      bullets: [
        { icon: FileText, text: 'Review discovered records' },
        { icon: Table2,   text: 'Name your sheet and save' },
      ],
    },
  ];

  const stepPreviews = isDiscovery ? discoveryStepPreviews : undefined;

  // ── Preview data ──
  const displayData = isDiscovery
    ? (activeStep === 0 ? [] : previewTableData)
    : (activeStep === 0 ? companyProspectPreviewData : previewTableData);

  const previewColumns = isDiscovery ? getDiscoveryPreviewColumns(liveType) : undefined;

  const isSearching = getPreviewDataLoading || getProspectDataLoading;
  const isLoading = isSearching || createTableLoading;

  // Resolve the active option for display
  const displayOption = liveType;

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-zinc-900/60">

      <header className="relative shrink-0 overflow-hidden border-b border-border bg-background shadow-sm">
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #39A380 0%, transparent 60%),
                              radial-gradient(circle at 80% 50%, #39A380 0%, transparent 60%)`,
          }}
        />

        <div className="relative flex items-center gap-4 px-5 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-sm hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex flex-1 items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: '#39A380' }}
            >
              {getHeaderIcon(displayOption)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
                  {getTitle(displayOption)}
                </h1>
                <span
                  className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--app-font-2xs)] font-semibold border"
                  style={{ backgroundColor: '#39A38015', color: '#39A380', borderColor: '#39A38030' }}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  AI-Powered
                </span>
              </div>
              <p className="mt-0.5 text-[length:var(--app-font-xs)] text-muted-foreground leading-snug line-clamp-1">
                {getDescription(displayOption)}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[length:var(--app-font-2xs)] font-bold transition-all ${
                    i < activeStep
                      ? 'text-white'
                      : i === activeStep
                      ? 'border-2 text-[#39A380]'
                      : 'border-2 border-border/40 text-muted-foreground/40 bg-muted/30'
                  }`}
                  style={
                    i < activeStep
                      ? { backgroundColor: '#39A380' }
                      : i === activeStep
                      ? { borderColor: '#39A380' }
                      : {}
                  }
                >
                  {i < activeStep ? '\u2713' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-6 rounded transition-all ${
                      i < activeStep ? 'bg-[#39A380]/50' : 'bg-border/40'
                    }`}
                  />
                )}
              </div>
            ))}
            <span className="ml-1 text-[length:var(--app-font-xs)] text-muted-foreground">
              Step {activeStep + 1} of {steps.length}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[28.75rem] shrink-0 overflow-y-auto px-4 pt-5 pb-6">
          <EnrichmentStepper
            activeStep={activeStep}
            steps={steps}
            stepContent={stepContent}
            stepActions={stepActions}
            stepPreviews={stepPreviews}
          />
        </div>

        <div className="flex flex-1 overflow-hidden p-4 pl-0">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="shrink-0 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {getPreviewTitle(displayOption)}
                </h2>
                {isDiscoveryPolling && discoveryProgress ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#39A380]/10 px-2 py-0.5 text-[length:var(--app-font-2xs)] font-semibold text-[#39A380] border border-[#39A380]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39A380] animate-pulse" />
                    {discoveryProgress.found}/{discoveryProgress.target} found
                  </span>
                ) : isLoading ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#39A380]/10 px-2 py-0.5 text-[length:var(--app-font-2xs)] font-semibold text-[#39A380] border border-[#39A380]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39A380] animate-pulse" />
                    Live
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[length:var(--app-font-2xs)] text-muted-foreground border border-border/50">
                    {displayData?.length ?? 0} records
                  </span>
                )}
              </div>

              {/* Discovery progress bar */}
              {isDiscovery && discoveryProgress && activeStep === 1 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-[length:var(--app-font-xs)] leading-snug transition-colors ${
                      isDiscoveryPolling ? 'text-[#39A380]/80' : 'text-muted-foreground'
                    }`}>
                      {(() => {
                        const entityLabel = ({ businesses: 'businesses', influencers: 'influencers', people_search: 'people', funding: 'startups', agencies: 'agencies', hiring: 'signals' } as Record<string, string>)[displayOption] || 'results';
                        return isDiscoveryPolling
                          ? `Discovering... ${discoveryProgress.found}/${discoveryProgress.target} ${entityLabel} found`
                          : discoveryStats?.duration
                            ? `Found ${previewTableData.length} ${entityLabel} in ${Math.round(discoveryStats.duration / 1000)}s`
                            : `${previewTableData.length} ${entityLabel} found`;
                      })()}
                    </p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isDiscoveryPolling ? 'bg-[#39A380]' : 'bg-[#39A380]/60'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          discoveryProgress.target > 0
                            ? (discoveryProgress.found / discoveryProgress.target) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Default description (non-discovery or no progress yet) */}
              {!(isDiscovery && discoveryProgress && activeStep === 1) && (
                <p
                  className={`mt-0.5 text-[length:var(--app-font-xs)] leading-snug max-w-2xl transition-colors ${
                    isLoading ? 'text-[#39A380]/80' : 'text-muted-foreground'
                  }`}
                >
                  {getPreviewDescription(isSearching, activeStep, displayOption)}
                </p>
              )}
            </div>

            <div className="relative flex-1 overflow-hidden">
              {isDiscoveryPolling && previewTableData.length > 0 ? (
                /* Show live table during async discovery polling */
                <div className="absolute inset-0 overflow-hidden">
                  <PreviewTable data={previewTableData} columns={previewColumns} />
                </div>
              ) : isSearching && !isDiscoveryPolling ? (
                <div className="absolute inset-0 overflow-y-auto">
                  <EnrichmentSkeleton
                    type="icp_search"
                    domain={isDiscovery ? undefined : currentDomain}
                  />
                </div>
              ) : isDiscoveryPolling && previewTableData.length === 0 ? (
                <div className="absolute inset-0 overflow-y-auto">
                  <EnrichmentSkeleton
                    type="icp_search"
                    domain={undefined}
                  />
                </div>
              ) : createTableLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <EnrichmentSkeleton type="table_creation" />
                </div>
              ) : isDiscovery && activeStep === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-8 py-10 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Ready to search</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Configure your criteria and click Search to see results
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  <PreviewTable data={displayData} columns={previewColumns} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
