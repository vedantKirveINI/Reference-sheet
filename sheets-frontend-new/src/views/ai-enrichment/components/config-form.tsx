import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
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
} from '../constants';
import { useEnrichmentParams } from '../use-enrichment-params';

interface FormValues {
  type: string;
  url: string;
  industries: string[];
  geographies: string[];
}

interface ConfigFormProps {
  value?: any;
  loading?: boolean;
  onDomainChange?: (domain: string) => void;
}

export interface ConfigFormHandle {
  saveAiConfigurationData: () => Promise<{
    type: { label: string; value: string };
    url: string;
    industries: string[];
    geographies: string[];
  }>;
}

export const ConfigForm = forwardRef<ConfigFormHandle, ConfigFormProps>(
  ({ loading = false, onDomainChange }, ref) => {
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
      },
    });

    const urlValue = watch('url');

    useEffect(() => {
      onDomainChange?.(urlValue || '');
    }, [urlValue]);

    useImperativeHandle(ref, () => ({
      saveAiConfigurationData: () =>
        new Promise((resolve, reject) => {
          handleSubmit(
            (data) => {
              const option = AI_ENRICHMENT_OPTIONS.find((o) => o.value === data.type);
              resolve({
                type: option || { label: 'Find Customer (Company)', value: data.type },
                url: data.url,
                industries: data.industries,
                geographies: data.geographies,
              });
            },
            (errs) => reject(errs)
          )();
        }),
    }));

    return (
      <div className="flex flex-col gap-4">
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
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <span className="text-[11px] text-destructive">{errors.type.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Enter company domain
          </label>
          <Input
            {...register('url', {
              required: 'Please enter a domain',
              pattern: {
                value: DOMAIN_REGEX,
                message: 'Enter a valid domain (e.g. google.com)',
              },
            })}
            placeholder="For eg- google.com"
            disabled={loading}
            className="h-9 rounded-xl border-border text-xs focus-visible:ring-[#39A380]/30"
          />
          {errors.url && (
            <span className="text-[11px] text-destructive">{errors.url.message}</span>
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
      </div>
    );
  }
);

ConfigForm.displayName = 'ConfigForm';
