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
      <TabBar tables={PLACEHOLDER_TABLES} activeTableId={PLACEHOLDER_TABLES[0]?.id} />
      {/* Content area: blurred backdrop + modal card so the card is distinct */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md" aria-hidden />
        <div className="relative z-10 flex flex-1 items-center justify-center overflow-auto p-6">
          <div className="w-full max-w-[900px] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl ring-1 ring-black/5">
            <GetStartedContent
              onCreateBlank={onCreateBlank}
              onSelectOption={onSelectOption}
              creating={creating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
