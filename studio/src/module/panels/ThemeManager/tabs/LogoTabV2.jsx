import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardDescription } from "@/components/ui/card";
import { icons } from "@/components/icons";
import SectionCard from "../components/SectionCard";
import FormRow from "../components/FormRow";
import SizeSelector from "../components/SizeSelector";
import AlignmentSelector from "../components/AlignmentSelector";

const LogoTabV2 = ({ logo = {}, onChange }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange?.({
          ...logo,
          image: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onChange?.({ ...logo, image: null });
  };

  const handleSizeChange = (size) => {
    onChange?.({ ...logo, size });
  };

  const handleAlignmentChange = (alignment) => {
    onChange?.({ ...logo, alignment });
  };

  const handleAltTextChange = (e) => {
    onChange?.({ ...logo, altText: e.target.value });
  };

  const ImageIcon = icons.image;
  const UploadIcon = icons.upload;
  const TrashIcon = icons.trash2;

  return (
    <div className="space-y-5">
      <SectionCard title="Logo">
        <div className="space-y-4">
          <CardDescription className="text-sm font-medium m-0">Image</CardDescription>
          {logo.image ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border bg-muted/50">
                <img
                  src={logo.image}
                  alt="Logo preview"
                  className="w-full h-28 object-contain"
                />
              </div>
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
              className="w-full h-28 flex flex-col items-center justify-center gap-2 border-dashed"
            >
              {ImageIcon ? <ImageIcon className="w-6 h-6 text-muted-foreground" /> : null}
              <span className="text-sm font-medium text-muted-foreground">Upload logo</span>
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

      <SectionCard title="Size and Positioning">
        <FormRow label="Logo Size">
          <SizeSelector value={logo.size || "M"} onChange={handleSizeChange} />
        </FormRow>
        <FormRow label="Logo Alignment">
          <AlignmentSelector
            value={logo.alignment || "left"}
            onChange={handleAlignmentChange}
          />
        </FormRow>
      </SectionCard>

      <SectionCard title="Alt Text">
        <div className="space-y-3">
          <CardDescription className="text-sm font-medium m-0">Alt text message</CardDescription>
          <Input
            value={logo.altText || ""}
            onChange={handleAltTextChange}
            placeholder="Type your message here."
            className="w-full"
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default LogoTabV2;
