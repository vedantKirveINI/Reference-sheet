import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const AddressCard = ({ data, label, accentColor = "#3b82f6" }) => {
  const { fields } = data;
  const { street, city, state, zip, country } = fields || {};
  
  const cityStateZip = [city, state, zip].filter(Boolean).join(", ");
  
  if (!street && !city && !state && !zip && !country) {
    return (
      <div className="rounded-xl bg-background border border-border/50 shadow-sm p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm italic">No address data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-background border border-border/50 shadow-sm overflow-hidden">
      {label && (
        <div 
          className="px-4 py-2.5 border-b border-border/30 flex items-center gap-2"
          style={{ backgroundColor: `${accentColor}08` }}
        >
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <MapPin 
              className="w-4 h-4" 
              style={{ color: accentColor }} 
            />
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
      )}
      
      <div className="p-4 space-y-1">
        {street && (
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {street}
          </p>
        )}
        
        {cityStateZip && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {cityStateZip}
          </p>
        )}
        
        {country && (
          <p className="text-xs text-muted-foreground/70 leading-relaxed uppercase tracking-wide">
            {country}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
