import { Dialog as DialogPrimitive } from 'radix-ui';
import { GetStartedContent } from '@/components/get-started-content';

interface GetStartedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBlank: (name: string) => void;
  onSelectOption: (optionId: string) => void;
  creating?: boolean;
}

export function GetStartedModal({
  open,
  onOpenChange,
  onCreateBlank,
  onSelectOption,
  creating = false,
}: GetStartedModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop — matches Studio: subtle dark tint + blur */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{
            backgroundColor: 'rgba(0,0,0,0.40)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />

        {/* Dialog — matches Studio: centered, responsive clamp sizing, 88vh cap */}
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] flex flex-col max-h-[88vh] overflow-hidden rounded-2xl border-0 bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
          style={{
            width: 'clamp(900px, 84vw, 1320px)',
            maxWidth: 'calc(100vw - 2rem)',
            minHeight: 'clamp(420px, 72vh, 820px)',
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            Create a new table
          </DialogPrimitive.Title>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <GetStartedContent
              onCreateBlank={onCreateBlank}
              onSelectOption={onSelectOption}
              creating={creating}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
