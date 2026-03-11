import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";

interface FocalPoint {
  x: number;
  y: number;
}

interface MobileFocalPointProps {
  imageUrl: string;
  focalPoint: FocalPoint;
  onChange: (focalPoint: FocalPoint) => void;
}

const MobileFocalPoint = ({
  imageUrl,
  focalPoint,
  onChange,
}: MobileFocalPointProps) => {
  const [open, setOpen] = useState(false);
  const [localPoint, setLocalPoint] = useState(focalPoint);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalPoint(focalPoint);
  }, [focalPoint]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePoint(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updatePoint(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePoint = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setLocalPoint({ x, y });
  };

  const handleSave = () => {
    onChange(localPoint);
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalPoint(focalPoint);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen(true)}
        data-testid="focal-point-btn"
      >
        <span className="flex items-center gap-2">
          <icons.smartphone className="size-3.5" />
          Mobile Focal Point
        </span>
        <span className="text-xs text-muted-foreground font-normal">Set center of focus</span>
      </Button>

      <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
        <DialogContent className="max-w-[500px]" onPointerDownOutside={handleCancel}>
          <DialogHeader>
            <DialogTitle>Set Mobile Focal Point</DialogTitle>
            <DialogDescription>
              Drag to set where to focus when cropping for mobile
            </DialogDescription>
          </DialogHeader>

          <div
            ref={containerRef}
            className="relative w-full aspect-video rounded-md overflow-hidden cursor-crosshair bg-muted"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={imageUrl}
              alt="Set focal point"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div
              className="absolute w-12 h-12 rounded-full border-[3px] border-white bg-primary/30 shadow-lg flex items-center justify-center pointer-events-none"
              style={{
                left: `${localPoint.x}%`,
                top: `${localPoint.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <icons.move className="size-4 text-white" />
            </div>
            <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-md pointer-events-none" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} data-testid="focal-point-save">
              <icons.check className="size-3.5" />
              Save Point
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileFocalPoint;
