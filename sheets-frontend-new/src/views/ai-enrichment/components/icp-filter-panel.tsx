import { forwardRef, useImperativeHandle, useRef, useState, Suspense } from 'react';
import { CollapsibleSection } from './collapsible-section';
import { IcpFilter, type IcpFilterHandle } from './icp-filter';
import { LocationFilter, type LocationFilterHandle } from './location-filter';
import { LimitFilter, type LimitFilterHandle } from './limit-filter';
import { Input } from '@/components/ui/input';

interface IcpFilterPanelProps {
  data?: any;
  tableName?: string;
  tableNameError?: boolean;
  onTableNameChange?: (value: string) => void;
}

export interface IcpFilterPanelHandle {
  saveAiConfigurationData: null;
  data: any[];
  filterData: {
    icpFilter: IcpFilterHandle | null;
    locationFilter: LocationFilterHandle | null;
    limitFilter: LimitFilterHandle | null;
  };
  scrollSheetNameIntoView: () => void;
}

export const IcpFilterPanel = forwardRef<IcpFilterPanelHandle, IcpFilterPanelProps>(
  ({ data, tableName = '', tableNameError = false, onTableNameChange }, ref) => {
    const icpFilterRef = useRef<IcpFilterHandle>(null);
    const locationFilterRef = useRef<LocationFilterHandle>(null);
    const limitFilterRef = useRef<LimitFilterHandle>(null);
    const sheetNameInputRef = useRef<HTMLInputElement | null>(null);

    const [filterCounts, setFilterCounts] = useState<Record<string, number>>({});
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      icpFilter: true,
      locationFilter: false,
      limitFilter: false,
    });

    useImperativeHandle(ref, () => ({
      saveAiConfigurationData: null,
      data: [],
      filterData: {
        get icpFilter() {
          return icpFilterRef.current;
        },
        get locationFilter() {
          return locationFilterRef.current;
        },
        get limitFilter() {
          return limitFilterRef.current;
        },
      },
      scrollSheetNameIntoView: () => {
        if (sheetNameInputRef.current) {
          sheetNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          sheetNameInputRef.current.focus();
        }
      },
    }));

    const handleFilterCountChange = (sectionId: string, count: number) => {
      setFilterCounts((prev) => ({ ...prev, [sectionId]: count }));
    };

    const handleToggle = (sectionId: string, isOpen: boolean) => {
      setOpenSections((prev) => ({ ...prev, [sectionId]: isOpen }));
    };

    const icpData = data?.icp?.icp || data?.icp || null;

    return (
      <div className="flex flex-col divide-y divide-border/30">
        <CollapsibleSection
          title="Company Attribute"
          sectionId="icpFilter"
          isOpen={openSections.icpFilter}
          onToggle={handleToggle}
          filterCount={filterCounts.icpFilter || 0}
        >
          <Suspense
            fallback={
              <div className="py-4 text-center text-xs text-muted-foreground">Loading filters...</div>
            }
          >
            <IcpFilter
              ref={icpFilterRef}
              data={icpData}
              sectionId="icpFilter"
              onFilterCountChange={handleFilterCountChange}
            />
          </Suspense>
        </CollapsibleSection>

        <CollapsibleSection
          title="Location"
          sectionId="locationFilter"
          isOpen={openSections.locationFilter}
          onToggle={handleToggle}
          filterCount={filterCounts.locationFilter || 0}
        >
          <Suspense
            fallback={
              <div className="py-4 text-center text-xs text-muted-foreground">Loading...</div>
            }
          >
            <LocationFilter
              ref={locationFilterRef}
              sectionId="locationFilter"
              onFilterCountChange={handleFilterCountChange}
            />
          </Suspense>
        </CollapsibleSection>

        <CollapsibleSection
          title="Limit Results"
          sectionId="limitFilter"
          isOpen={openSections.limitFilter}
          onToggle={handleToggle}
          filterCount={filterCounts.limitFilter || 0}
        >
          <LimitFilter
            ref={limitFilterRef}
            sectionId="limitFilter"
            onFilterCountChange={handleFilterCountChange}
          />
        </CollapsibleSection>

        <div className="pt-4">
          <label
            htmlFor="ai-enrichment-table-name"
            className="block text-xs font-semibold text-foreground mb-1"
          >
            Sheet name <span className="text-destructive">*</span>
          </label>
          <Input
            id="ai-enrichment-table-name"
            ref={sheetNameInputRef}
            value={tableName}
            onChange={(e) => onTableNameChange?.(e.target.value)}
            placeholder="e.g. Ideal Customers — Company"
            className={`h-8 rounded-xl text-xs focus-visible:ring-2 ${
              tableNameError
                ? 'border-destructive focus-visible:ring-destructive/40'
                : 'border-border focus-visible:ring-[#39A380]/30'
            }`}
          />
          {tableNameError ? (
            <p className="mt-1 text-[11px] text-destructive">
              Sheet name is required to create the sheet.
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              This will be the name of your new sheet.
            </p>
          )}
        </div>
      </div>
    );
  }
);

IcpFilterPanel.displayName = 'IcpFilterPanel';
