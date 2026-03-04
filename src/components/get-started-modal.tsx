import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[900px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3.5 right-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <GetStartedContent
          onCreateBlank={onCreateBlank}
          onSelectOption={onSelectOption}
          creating={creating}
        />
      </DialogContent>
    </Dialog>
  );
}
