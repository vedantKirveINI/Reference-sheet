import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Building2, Users } from 'lucide-react';
import { EnrichmentStepper } from './components/enrichment-stepper';
import { ConfigForm, type ConfigFormHandle } from './components/config-form';
import { IcpFilterPanel, type IcpFilterPanelHandle } from './components/icp-filter-panel';
import { PreviewTable } from './components/preview-table';
import { EnrichmentSkeleton } from './components/enrichment-skeleton';
import { useEnrichmentConfiguration } from './hooks/use-enrichment-configuration';
import { useEnrichmentParams } from './use-enrichment-params';
import { STEPS } from './constants';
import { companyProspectPreviewData } from './dummy-data';

function getTitle(aiOption: string): string {
  if (aiOption === 'people') return 'Find Customers — People';
  return 'Find Customers — Company';
}

function getDescription(aiOption: string): string {
  if (aiOption === 'people') {
    return 'Identify key decision makers and contacts that match your Ideal Customer Profile using AI intelligence.';
  }
  return 'Enter a company domain and let AI discover similar businesses that are your best-fit customers.';
}

function getPreviewDescription(loading: boolean, step: number): string {
  if (loading) {
    return 'AI is scanning millions of companies to find your best-fit customers. Sit tight — this only takes a moment.';
  }
  if (step === 0) {
    return 'Sample records showing what your results will look like. Fill the form and search to see real matches.';
  }
  return 'Real companies matching your ICP — refine the filters on the left to narrow down your list.';
}

export function AiEnrichmentPage() {
  const navigate = useNavigate();
  const { aiOption } = useEnrichmentParams();

  const {
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
  } = useEnrichmentConfiguration();

  const configFormRef = useRef<ConfigFormHandle>(null);
  const icpFilterPanelRef = useRef<IcpFilterPanelHandle>(null);

  const stepContent: React.ReactNode[] = [
    <ConfigForm
      key="config-form"
      ref={(r) => {
        (configFormRef as any).current = r;
        if (r) configRef.current.saveAiConfigurationData = r.saveAiConfigurationData;
      }}
      loading={getPreviewDataLoading}
      onDomainChange={setCurrentDomain}
    />,
    <IcpFilterPanel
      key="icp-filter-panel"
      ref={(r) => {
        (icpFilterPanelRef as any).current = r;
        if (r) configRef.current.filterData = r.filterData;
      }}
      data={previewData}
    />,
  ];

  const stepActions = [
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
        disabled: createTableLoading || getProspectDataLoading,
      },
    ],
  ];

  const displayData = activeStep === 0 ? companyProspectPreviewData : previewTableData;
  const isLoading = getPreviewDataLoading || createTableLoading;

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
              {aiOption === 'people'
                ? <Users className="h-4.5 w-4.5 text-white" />
                : <Building2 className="h-4 w-4 text-white" />
              }
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
                  {getTitle(aiOption)}
                </h1>
                <span
                  className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                  style={{ backgroundColor: '#39A38015', color: '#39A380', borderColor: '#39A38030' }}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  AI-Powered
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug line-clamp-1">
                {getDescription(aiOption)}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
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
                  {i < activeStep ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 rounded transition-all ${
                      i < activeStep ? 'bg-[#39A380]/50' : 'bg-border/40'
                    }`}
                  />
                )}
              </div>
            ))}
            <span className="ml-1 text-[11px] text-muted-foreground">
              Step {activeStep + 1} of {STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[460px] shrink-0 overflow-y-auto px-4 pt-5 pb-6">
          <EnrichmentStepper
            activeStep={activeStep}
            steps={STEPS}
            stepContent={stepContent}
            stepActions={stepActions}
          />
        </div>

        <div className="flex flex-1 overflow-hidden p-4 pl-0">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="shrink-0 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Ideal Customer Profile Preview
                </h2>
                {isLoading && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#39A380]/10 px-2 py-0.5 text-[10px] font-semibold text-[#39A380] border border-[#39A380]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39A380] animate-pulse" />
                    Live
                  </span>
                )}
                {!isLoading && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground border border-border/50">
                    {displayData?.length ?? 0} records
                  </span>
                )}
              </div>
              <p
                className={`mt-0.5 text-[11px] leading-snug max-w-2xl transition-colors ${
                  isLoading ? 'text-[#39A380]/80' : 'text-muted-foreground'
                }`}
              >
                {getPreviewDescription(getPreviewDataLoading, activeStep)}
              </p>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {getPreviewDataLoading ? (
                <div className="absolute inset-0 overflow-y-auto">
                  <EnrichmentSkeleton type="icp_search" domain={currentDomain} />
                </div>
              ) : createTableLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <EnrichmentSkeleton type="table_creation" />
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  <PreviewTable data={displayData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
