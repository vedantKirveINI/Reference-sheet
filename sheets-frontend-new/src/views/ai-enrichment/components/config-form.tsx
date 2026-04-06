import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MultiSelectChipInput } from './multi-select-chip-input';
import {
  AI_ENRICHMENT_OPTIONS,
  DOMAIN_REGEX,
  INDUSTRY_OPTIONS,
  GEOGRAPHY_OPTIONS,
  COUNTRY_OPTIONS,
  PLATFORM_OPTIONS,
  SENIORITY_OPTIONS,
  FUNDING_ROUND_OPTIONS,
  isDiscoveryType,
} from '../constants';
import { useEnrichmentParams } from '../use-enrichment-params';

interface FormValues {
  type: string;
  url: string;
  industries: string[];
  geographies: string[];
  // Discovery: business fields
  query: string;
  country: string;
  location: string;
  category: string;
  limit: number;
  // Discovery: influencer fields
  platform: string;
  minFollowers: number;
  // Discovery: people search fields
  jobTitle: string;
  company: string;
  seniority: string;
  skills: string;
  industry: string;
  education: string;
  // Discovery: funding fields
  round: string;
  timeframe: string;
  // Discovery: agency fields
  serviceType: string;
  // Discovery: hiring fields
  tools: string;
  role: string;
}

interface ConfigFormProps {
  value?: any;
  loading?: boolean;
  onDomainChange?: (domain: string) => void;
  onTypeChange?: (type: string) => void;
}

export interface ConfigFormHandle {
  saveAiConfigurationData: () => Promise<any>;
}

export const ConfigForm = forwardRef<ConfigFormHandle, ConfigFormProps>(
  ({ loading = false, onDomainChange, onTypeChange }, ref) => {
    const { aiOption } = useEnrichmentParams();

    const {
      register,
      control,
      watch,
      handleSubmit,
      formState: { errors },
    } = useForm<FormValues>({
      defaultValues: {
        type: aiOption || 'companies',
        url: '',
        industries: [],
        geographies: [],
        query: '',
        country: '',
        location: '',
        category: '',
        limit: 20,
        platform: 'instagram',
        minFollowers: 1000,
        jobTitle: '',
        company: '',
        seniority: '',
        skills: '',
        industry: '',
        education: '',
        round: '',
        timeframe: '2026',
        serviceType: '',
        tools: '',
        role: '',
      },
    });

    const urlValue = watch('url');
    const typeValue = watch('type');

    useEffect(() => {
      onDomainChange?.(urlValue || '');
    }, [urlValue]);

    useEffect(() => {
      onTypeChange?.(typeValue || 'companies');
    }, [typeValue]);

    useImperativeHandle(ref, () => ({
      saveAiConfigurationData: () =>
        new Promise((resolve, reject) => {
          handleSubmit(
            (data) => {
              const option = AI_ENRICHMENT_OPTIONS.find((o) => o.value === data.type);

              if (data.type === 'businesses') {
                resolve({
                  type: option || { label: 'Find Businesses', value: data.type },
                  query: data.query,
                  country: data.country,
                  location: data.location,
                  category: data.category,
                  limit: data.limit,
                });
              } else if (data.type === 'influencers') {
                resolve({
                  type: option || { label: 'Find Influencers', value: data.type },
                  query: data.query,
                  platform: data.platform,
                  minFollowers: data.minFollowers,
                  country: data.country,
                  limit: data.limit,
                });
              } else if (data.type === 'people_search') {
                resolve({
                  type: option || { label: 'Find People', value: data.type },
                  jobTitle: data.jobTitle,
                  company: data.company,
                  location: data.location,
                  seniority: data.seniority,
                  skills: data.skills ? data.skills.split(',').map((s: string) => s.trim()) : [],
                  industry: data.industry,
                  education: data.education,
                  limit: data.limit,
                });
              } else if (data.type === 'funding') {
                resolve({
                  type: option || { label: 'Find Funded Startups', value: data.type },
                  industry: data.industry,
                  round: data.round,
                  location: data.location,
                  timeframe: data.timeframe,
                  limit: data.limit,
                });
              } else if (data.type === 'agencies') {
                resolve({
                  type: option || { label: 'Find Agencies', value: data.type },
                  serviceType: data.serviceType,
                  location: data.location,
                  industry: data.industry,
                  limit: data.limit,
                });
              } else if (data.type === 'hiring') {
                resolve({
                  type: option || { label: 'Find Hiring Signals', value: data.type },
                  tools: data.tools,
                  role: data.role,
                  location: data.location,
                  industry: data.industry,
                  limit: data.limit,
                });
              } else {
                resolve({
                  type: option || { label: 'Find Customer (Company)', value: data.type },
                  url: data.url,
                  industries: data.industries,
                  geographies: data.geographies,
                });
              }
            },
            (errs) => reject(errs)
          )();
        }),
    }));

    const isDiscovery = isDiscoveryType(typeValue);
    const isBusiness = typeValue === 'businesses';
    const isInfluencer = typeValue === 'influencers';
    const isPeopleSearch = typeValue === 'people_search';
    const isFunding = typeValue === 'funding';
    const isAgencies = typeValue === 'agencies';
    const isHiring = typeValue === 'hiring';

    return (
      <div className="flex flex-col gap-4">
        {/* Type selector — always visible */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Select type of enrichment
          </label>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Please select a type' }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={loading}
              >
                <SelectTrigger className="h-9 rounded-xl border-border text-xs focus:ring-[#39A380]/30">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {AI_ENRICHMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      <span className="flex items-center gap-2">
                        <span>{opt.label}</span>
                        {opt.creditCost && (
                          <span className="text-[10px] text-amber-600 font-medium ml-auto">{opt.creditCost}</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <span className="text-[length:var(--app-font-xs)] text-destructive">{errors.type.message}</span>
          )}
        </div>

        {/* ── Existing ICP fields (companies / people / competitors) ── */}
        {!isDiscovery && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Enter company domain
              </label>
              <Input
                {...register('url', {
                  required: !isDiscovery ? 'Please enter a domain' : false,
                  pattern: !isDiscovery
                    ? {
                        value: DOMAIN_REGEX,
                        message: 'Enter a valid domain (e.g. google.com)',
                      }
                    : undefined,
                })}
                placeholder="For eg- google.com"
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
              {errors.url && (
                <span className="text-[length:var(--app-font-xs)] text-destructive">{errors.url.message}</span>
              )}
            </div>

            <Controller
              name="industries"
              control={control}
              render={({ field }) => (
                <MultiSelectChipInput
                  label="Industries"
                  placeholder="Select or add industries..."
                  options={INDUSTRY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="geographies"
              control={control}
              render={({ field }) => (
                <MultiSelectChipInput
                  label="Geographies"
                  placeholder="Select or add geographies..."
                  options={GEOGRAPHY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                />
              )}
            />
          </>
        )}

        {/* ── Business discovery fields ── */}
        {isBusiness && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                What businesses? <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('query', {
                  required: isBusiness ? 'Please describe the businesses you want to find' : false,
                })}
                placeholder='e.g. "automation agency", "coffee shop"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
              {errors.query && (
                <span className="text-[length:var(--app-font-xs)] text-destructive">{errors.query.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Country</label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 rounded-xl border-border text-xs focus:ring-[#39A380]/30">
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">City / Area</label>
              <Input
                {...register('location')}
                placeholder='e.g. "New York", "London"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <Input
                {...register('category')}
                placeholder='e.g. "marketing", "restaurants"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Result limit</label>
              <Input
                type="number"
                {...register('limit', { valueAsNumber: true, min: 1, max: 100 })}
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>
          </>
        )}

        {/* ── Influencer discovery fields ── */}
        {isInfluencer && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                What topic / niche? <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('query', {
                  required: isInfluencer ? 'Please describe the niche or topic' : false,
                })}
                placeholder='e.g. "fitness coach", "SaaS marketing"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
              {errors.query && (
                <span className="text-[length:var(--app-font-xs)] text-destructive">{errors.query.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Platform</label>
              <Controller
                name="platform"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={loading}
                        onClick={() => field.onChange(opt.value)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                          field.value === opt.value
                            ? 'border-[#39A380]/40 bg-[#39A380]/10 text-[#39A380]'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted/60'
                        } disabled:opacity-50`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Min followers</label>
              <Input
                type="number"
                {...register('minFollowers', { valueAsNumber: true, min: 0 })}
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Country</label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 rounded-xl border-border text-xs focus:ring-[#39A380]/30">
                      <SelectValue placeholder="Optional — any country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Result limit</label>
              <Input
                type="number"
                {...register('limit', { valueAsNumber: true, min: 1, max: 100 })}
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>
          </>
        )}

        {/* ── People search discovery fields ── */}
        {isPeopleSearch && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Job Title</label>
              <Input
                {...register('jobTitle')}
                placeholder='e.g. "Marketing Manager", "CTO"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Company</label>
              <Input
                {...register('company')}
                placeholder='e.g. "Salesforce", "HubSpot"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Location</label>
              <Input
                {...register('location')}
                placeholder='e.g. "San Francisco", "London"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Seniority</label>
              <Controller
                name="seniority"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 rounded-xl border-border text-xs focus:ring-[#39A380]/30">
                      <SelectValue placeholder="Any seniority level" />
                    </SelectTrigger>
                    <SelectContent>
                      {SENIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Skills (comma-separated)</label>
              <Input
                {...register('skills')}
                placeholder='e.g. "Python, React, Sales"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Industry</label>
              <Input
                {...register('industry')}
                placeholder='e.g. "SaaS", "Fintech"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Education</label>
              <Input
                {...register('education')}
                placeholder='e.g. "Stanford", "MBA"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Result limit</label>
              <Input
                type="number"
                {...register('limit', { valueAsNumber: true, min: 1, max: 100 })}
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>
          </>
        )}

        {/* ── Funding discovery fields ── */}
        {isFunding && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Industry</label>
              <Input
                {...register('industry')}
                placeholder='e.g. "SaaS", "Healthtech"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Funding Round</label>
              <Controller
                name="round"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 rounded-xl border-border text-xs focus:ring-[#39A380]/30">
                      <SelectValue placeholder="Any round" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_ROUND_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Location</label>
              <Input
                {...register('location')}
                placeholder='e.g. "San Francisco", "Europe"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Timeframe</label>
              <Input
                {...register('timeframe')}
                placeholder='e.g. "2026", "last 6 months"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Result limit</label>
              <Input
                type="number"
                {...register('limit', { valueAsNumber: true, min: 1, max: 100 })}
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>
          </>
        )}

        {/* ── Agency discovery fields ── */}
        {isAgencies && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Service Type <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('serviceType', {
                  required: isAgencies ? 'Please describe the service type' : false,
                })}
                placeholder='e.g. "SEO agency", "web development"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
              {errors.serviceType && (
                <span className="text-[length:var(--app-font-xs)] text-destructive">{errors.serviceType.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Location</label>
              <Input
                {...register('location')}
                placeholder='e.g. "New York", "London"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Industry</label>
              <Input
                {...register('industry')}
                placeholder='e.g. "SaaS", "E-commerce"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Result limit</label>
              <Input
                type="number"
                {...register('limit', { valueAsNumber: true, min: 1, max: 100 })}
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>
          </>
        )}

        {/* ── Hiring signals discovery fields ── */}
        {isHiring && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Tools</label>
              <Input
                {...register('tools')}
                placeholder='e.g. "Zapier, Make.com, HubSpot"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Role</label>
              <Input
                {...register('role')}
                placeholder='e.g. "Marketing Operations", "RevOps"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Location</label>
              <Input
                {...register('location')}
                placeholder='e.g. "United States", "Remote"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Industry</label>
              <Input
                {...register('industry')}
                placeholder='e.g. "SaaS", "Fintech"'
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Result limit</label>
              <Input
                type="number"
                {...register('limit', { valueAsNumber: true, min: 1, max: 100 })}
                disabled={loading}
                className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
              />
            </div>
          </>
        )}
      </div>
    );
  }
);

ConfigForm.displayName = 'ConfigForm';
