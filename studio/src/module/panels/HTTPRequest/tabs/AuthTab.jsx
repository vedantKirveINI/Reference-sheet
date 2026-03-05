import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const AUTH_TYPES = [
  { value: "none", label: "No Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
  { value: "api-key", label: "API Key" },
];

const defaultAuth = {
  type: "none",
  token: "",
  username: "",
  password: "",
  apiKey: "",
  apiKeyName: "X-API-Key",
};

export function AuthTab({ auth = defaultAuth, onChange }) {
  const currentAuth = { ...defaultAuth, ...auth };

  const handleTypeChange = (type) => {
    onChange?.({ ...currentAuth, type });
  };

  const handleFieldChange = (field, value) => {
    onChange?.({ ...currentAuth, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          className="text-sm font-medium text-gray-700"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          Authentication Type
        </Label>
        <Select value={currentAuth.type} onValueChange={handleTypeChange}>
          <SelectTrigger
            className={cn(
              "w-full rounded-xl border-gray-200",
              "focus:border-[#1C3693] focus:ring-[#1C3693]/20"
            )}
          >
            <SelectValue placeholder="Select auth type" />
          </SelectTrigger>
          <SelectContent>
            {AUTH_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentAuth.type === "none" && (
        <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
          No authentication required for this request
        </div>
      )}

      {currentAuth.type === "bearer" && (
        <div className="space-y-2">
          <Label
            className="text-sm font-medium text-gray-700"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            Bearer Token
          </Label>
          <Input
            type="text"
            value={currentAuth.token}
            onChange={(e) => handleFieldChange("token", e.target.value)}
            placeholder="Enter your bearer token..."
            className={cn(
              "rounded-xl border-gray-200",
              "focus:border-[#1C3693] focus:ring-[#1C3693]/20"
            )}
          />
          <p className="text-xs text-gray-400">
            The token will be sent as: Authorization: Bearer {"<token>"}
          </p>
        </div>
      )}

      {currentAuth.type === "basic" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              Username
            </Label>
            <Input
              type="text"
              value={currentAuth.username}
              onChange={(e) => handleFieldChange("username", e.target.value)}
              placeholder="Enter username..."
              className={cn(
                "rounded-xl border-gray-200",
                "focus:border-[#1C3693] focus:ring-[#1C3693]/20"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              Password
            </Label>
            <Input
              type="password"
              value={currentAuth.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              placeholder="Enter password..."
              className={cn(
                "rounded-xl border-gray-200",
                "focus:border-[#1C3693] focus:ring-[#1C3693]/20"
              )}
            />
          </div>
          <p className="text-xs text-gray-400">
            Credentials will be Base64 encoded and sent in the Authorization header
          </p>
        </div>
      )}

      {currentAuth.type === "api-key" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              Header Name
            </Label>
            <Input
              type="text"
              value={currentAuth.apiKeyName}
              onChange={(e) => handleFieldChange("apiKeyName", e.target.value)}
              placeholder="X-API-Key"
              className={cn(
                "rounded-xl border-gray-200",
                "focus:border-[#1C3693] focus:ring-[#1C3693]/20"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              API Key
            </Label>
            <Input
              type="password"
              value={currentAuth.apiKey}
              onChange={(e) => handleFieldChange("apiKey", e.target.value)}
              placeholder="Enter your API key..."
              className={cn(
                "rounded-xl border-gray-200",
                "focus:border-[#1C3693] focus:ring-[#1C3693]/20"
              )}
            />
          </div>
          <p className="text-xs text-gray-400">
            The API key will be sent as a custom header
          </p>
        </div>
      )}
    </div>
  );
}

export default AuthTab;
