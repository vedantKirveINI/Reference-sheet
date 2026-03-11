import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { icons } from "@/components/icons";
import SectionCard from "../components/SectionCard";
import FormRow from "../components/FormRow";
import ColorPickerField from "../components/ColorPickerField";

const BackgroundTabV2 = ({ background = {}, onChange }) => {
  const fileInputRef = useRef(null);

  const handleColorChange = (color) => {
    onChange?.({ ...background, color });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange?.({
          ...background,
          image: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onChange?.({ ...background, image: null });
  };

  const ImageIcon = icons.image;
  const UploadIcon = icons.upload;
  const TrashIcon = icons.trash2;

  return (
    <div className="space-y-5">
      <SectionCard title="Color">
        <FormRow label="Background color">
          <ColorPickerField
            value={background.color || "#FDDEDA"}
            onChange={handleColorChange}
          />
        </FormRow>
      </SectionCard>

      <SectionCard title="Image">
        <div className="space-y-4">
          <CardDescription className="text-sm font-medium m-0">Background image</CardDescription>
          {background.image ? (
            <div className="space-y-4">
              <div
                className="relative rounded-xl overflow-hidden border h-36 bg-muted/50"
                style={{
                  backgroundImage: `url(${background.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  {UploadIcon ? <UploadIcon className="w-4 h-4" /> : null}
                  Replace
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="gap-2"
                >
                  {TrashIcon ? <TrashIcon className="w-4 h-4" /> : null}
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 flex flex-col items-center justify-center gap-2 border-dashed"
            >
              {ImageIcon ? <ImageIcon className="w-6 h-6 text-muted-foreground" /> : null}
              <span className="text-sm font-medium text-muted-foreground">Upload background image</span>
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default BackgroundTabV2;
