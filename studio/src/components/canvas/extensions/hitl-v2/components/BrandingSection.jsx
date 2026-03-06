import React, { useRef } from "react";
import { Image, Trash2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import storageSDKServices from "../../../services/storageSDKServices";
import { toast } from "sonner";

const BrandingSection = ({ branding, onBrandingChange, onLogoUpload, errors = [] }) => {
  const fileInputRef = useRef(null);
  const hasLogoSizeError =
    errors?.some(
      (err) => err === "Logo size exceeds 2MB. Please upload a smaller file."
    ) || false;

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ["image/png", "image/jpeg", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or SVG file");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error("Logo size exceeds 2MB. Please upload a smaller file.");
      return;
    }

    // Read and upload file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const file_obj = new Blob([arrayBuffer], { type: file.type });

      const body = {
        fileName: file.name,
        fileType: file.type,
        file_obj,
      };

      try {
        const response = await storageSDKServices.uploadFile(body);
        if (response.status === "success") {
          onBrandingChange({
            ...branding,
            logo_url: response.result.cdn,
            logo_details: {
              ...(response.result || {}),
              fileName: file.name,
              fileType: file.type,
            },
          });
          toast.success("Logo uploaded successfully");
        }
      } catch (error) {
        toast.error("An error occurred while uploading the logo. Please try again.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDeleteLogo = () => {
    onBrandingChange({
      ...branding,
      logo_url: "",
      logo_details: {},
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-600" />
        <Label className="text-sm font-medium text-gray-900">
          Brand Theme (Optional - Premium Accounts)
        </Label>
      </div>

      <p className="text-xs text-gray-600">
        Customize the appearance of the review interface with your company branding.
        These settings are only available for premium accounts.
      </p>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Brand Logo</Label>
        {branding?.logo_url && (
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-white">
              <img
                src={branding.logo_url}
                alt="Brand logo"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteLogo}
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-9"
          >
            <Image className="w-4 h-4 mr-2" />
            {branding?.logo_url ? "Change Logo" : "Upload Logo"}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Upload your company logo (PNG, JPG, or SVG). Recommended size: 200x50px. Max file
          size: 2MB.
        </p>
        {hasLogoSizeError && (
          <p className="text-xs text-red-600">
            Logo size exceeds 2MB. Please upload a smaller file.
          </p>
        )}
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Primary Theme Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={branding?.primary_color || "#1A73E8"}
            onChange={(e) =>
              onBrandingChange({
                ...branding,
                primary_color: e.target.value,
              })
            }
            className="w-12 h-9 rounded border border-gray-300 cursor-pointer"
          />
          <Input
            type="text"
            value={branding?.primary_color || "#1A73E8"}
            onChange={(e) =>
              onBrandingChange({
                ...branding,
                primary_color: e.target.value,
              })
            }
            className="flex-1 h-9"
            placeholder="#1A73E8"
          />
        </div>
        <p className="text-xs text-gray-500">
          This color will be used for headers, borders, and other UI elements. Choose a color
          that matches your brand.
        </p>
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Accent Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={branding?.accent_color || "#F4B400"}
            onChange={(e) =>
              onBrandingChange({
                ...branding,
                accent_color: e.target.value,
              })
            }
            className="w-12 h-9 rounded border border-gray-300 cursor-pointer"
          />
          <Input
            type="text"
            value={branding?.accent_color || "#F4B400"}
            onChange={(e) =>
              onBrandingChange({
                ...branding,
                accent_color: e.target.value,
              })
            }
            className="flex-1 h-9"
            placeholder="#F4B400"
          />
        </div>
        <p className="text-xs text-gray-500">
          This color will be used for highlights, buttons, and interactive elements. It should
          complement your primary color.
        </p>
      </div>
    </div>
  );
};

export default BrandingSection;
