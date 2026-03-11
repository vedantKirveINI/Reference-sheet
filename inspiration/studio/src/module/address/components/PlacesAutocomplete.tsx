import { useState, useEffect } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
interface PlacesAutocompleteProps {
  apiKey?: string;
  onPlaceSelected?: (place: any) => void;
  placeholder?: string;
  defaultValue?: string;
  theme?: any;
  searchOptions?: any;
}

// Declare the google variable
declare global {
  interface Window {
    google?: any;
    initAutocomplete?: () => void;
  }
}

export default function LocationSearchInput({
  apiKey = "",
  onPlaceSelected = () => {},
  placeholder = "Search for a location",
  defaultValue = "",
  theme,
  searchOptions,
}: PlacesAutocompleteProps) {
  const [address, setAddress] = useState(defaultValue);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      return;
    }

    // Define the callback function that will be called when the script loads
    window.initAutocomplete = () => {
      setScriptLoaded(true);
    };

    // Check if script is already loaded
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Remove the global callback
      delete window.initAutocomplete;
    };
  }, [apiKey]);

  const handleSelect = async (selectedAddress: any) => {
    setAddress(selectedAddress);

    try {
      const results = await geocodeByAddress(selectedAddress);
      const latLng = await getLatLng(results[0]);

      const place = {
        name: selectedAddress.split(",")[0],
        formatted_address: selectedAddress,
        geometry: {
          location: {
            lat: () => latLng.lat,
            lng: () => latLng.lng,
          },
        },
        address_components: results[0].address_components,
      };

      onPlaceSelected(place);
    } catch (error) {
      const place = {
        name: selectedAddress.split(",")[0] || selectedAddress,
        formatted_address: selectedAddress,
      };
      onPlaceSelected(place);
    }
  };

  const handleChange = (newAddress: string) => {
    setAddress(newAddress);
  };

  const handleManualSubmit = () => {
    if (!address.trim()) {
      handleSelect("");
    } else {
      handleSelect(address);
    }
  };

  const addressPlaceholderClass =
    "placeholder:opacity-90 placeholder-[color:var(--address-placeholder)]";

  if (!scriptLoaded) {
    return (
      <Input
        required
        value={address}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {
          handleManualSubmit();
        }}
        placeholder={placeholder}
        data-testid="address-line-one-text-field"
        className={cn(
          "w-full border-0 border-b-2 rounded-none px-0 py-[0.625em]",
          "bg-transparent focus-visible:ring-0 focus-visible:border-b-primary h-14",
          addressPlaceholderClass
        )}
        style={{
          borderBottom: `1px solid ${theme?.styles?.buttons}`,
          fontSize: "1.15em",
          fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
          color: theme?.styles?.buttons,
        }}
      />
    );
  }

  return (
    <div className="w-full relative">
      <PlacesAutocomplete
        value={address}
        onChange={handleChange}
        onSelect={handleSelect}
        searchOptions={searchOptions}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps }) => {
          const customInputProps = getInputProps({
            placeholder,
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleManualSubmit();
              }
            },
            onBlur: () => {
              handleManualSubmit();
            },
          });

          // Extract data-testid from inputProps if present
          const inputProps = customInputProps.inputProps || {};
          const dataTestId = inputProps["data-testid"] || "address-line-one-text-field";

          return (
            <>
              <Input
                {...customInputProps}
                data-testid={dataTestId}
                className={cn(
                  "w-full border-0 border-b-2 rounded-none px-0 py-[0.625em]",
                  "bg-transparent focus-visible:ring-0 focus-visible:border-b-primary h-14",
                  addressPlaceholderClass
                )}
                style={{
                  borderBottom: `1px solid ${theme?.styles?.buttons}`,
                  fontSize: "1.15em",
                  fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
                  color: theme?.styles?.buttons,
                }}
              />
              <div
                className={cn(
                  "absolute z-[1000] w-full bg-white shadow-md max-h-[200px] overflow-y-auto",
                  "border border-[#cfd8dc] mt-[0.38em] rounded-[0.375em] p-[0.375em]",
                  "flex flex-col gap-[0.375em]",
                  suggestions.length ? "block" : "hidden"
                )}
              >
                {suggestions.map((suggestion) => {
                  const isActive = suggestion.active;
                  const isSelected = address === suggestion?.description;
                  
                  return (
                    <div
                      {...getSuggestionItemProps(suggestion, {})}
                      className={cn(
                        "rounded-[0.375em] p-[0.75em] cursor-pointer",
                        isSelected
                          ? "bg-[rgba(33,150,243,0.08)]"
                          : isActive
                          ? "bg-black/5"
                          : ""
                      )}
                      key={suggestion.placeId}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  );
                })}
              </div>
            </>
          );
        }}
      </PlacesAutocomplete>
    </div>
  );
}
