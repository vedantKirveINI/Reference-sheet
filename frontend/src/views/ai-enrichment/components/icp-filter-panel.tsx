import { forwardRef, useImperativeHandle, useRef, useState, Suspense } from 'react';
import { CollapsibleSection } from './collapsible-section';
import { IcpFilter, type IcpFilterHandle } from './icp-filter';
import { LocationFilter, type LocationFilterHandle } from './location-filter';
import { LimitFilter, type LimitFilterHandle } from './limit-filter';

interface IcpFilterPanelProps {
  data?: any;
}

export interface IcpFilterPanelHandle {
  saveAiConfigurationData: null;
  data: any[];
  filterData: {
    icpFilter: IcpFilterHandle | null;
    locationFilter: LocationFilterHandle | null;
    limitFilter: LimitFilterHandle | null;
  };
}

export const IcpFilterPanel = forwardRef<IcpFilterPanelHandle, IcpFilterPanelProps>(
  ({ data }, ref) => {
    const icpFilterRef = useRef<IcpFilterHandle>(null);
    const locationFilterRef = useRef<LocationFilterHandle>(null);
    const limitFilterRef = useRef<LimitFilterHandle>(null);

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
      </div>
    );
  }
);

IcpFilterPanel.displayName = 'IcpFilterPanel';
