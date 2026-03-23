import { Header } from '@/components/layout/header';
import { TabBar } from '@/components/layout/tab-bar';
import { GetStartedContent } from '@/components/get-started-content';

const PLACEHOLDER_TABLES = [{ id: 'placeholder', name: 'Untitled' }];

interface GetStartedPageProps {
  onCreateBlank: (name: string) => void;
  onSelectOption: (optionId: string) => void;
  creating?: boolean;
}

/**
 * Full-page Get Started layout (reference: Header + TabBar + Dashboard).
 * Shown when URL has q but no assetId (a). User chooses Create blank or an AI option.
 */
export function GetStartedPage({
  onCreateBlank,
  onSelectOption,
  creating = false,
}: GetStartedPageProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <Header />
      <TabBar
        tables={PLACEHOLDER_TABLES}
        activeTableId={PLACEHOLDER_TABLES[0]?.id}
      />

      {/* Content area: backdrop blur + centered floating card matching Studio's dialog */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Backdrop — matches Studio: subtle dark tint + blur */}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            backgroundColor: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        />

        {/* Centered card — matches Studio's dialog sizing */}
        <div className="relative z-10 flex flex-1 items-center justify-center overflow-auto p-6">
          <div
            className="flex max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-background shadow-2xl"
            style={{
              width: 'clamp(900px, 84vw, 1320px)',
              maxWidth: 'calc(100vw - 2rem)',
              minHeight: 'clamp(420px, 72vh, 820px)',
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <GetStartedContent
                onCreateBlank={onCreateBlank}
                onSelectOption={onSelectOption}
                creating={creating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
