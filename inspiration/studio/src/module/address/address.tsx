import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { FreeSoloAutocomplete } from "./components/FreeSoloAutocomplete";
import { cn } from "@/lib/utils";
import { countries, Mode, ViewPort } from "@src/module/constants";
import LocationSearchInput from "./components/PlacesAutocomplete";
import { useAddressQuestion } from "./hooks/use-address-question";
import { getCountryCode } from "./utils";
import { ENV } from "./constant";
export interface AddressProps {
  isCreator?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  settings?: any;
  theme?: any;
  autoFocus?: boolean;
  viewPort?: any;
  mode?: Mode;
}

export const Address = forwardRef(
  (
    {
      isCreator,
      value,
      onChange,
      settings,
      theme,
      autoFocus = false,
      viewPort,
      mode,
    }: AddressProps,
    ref: any
  ) => {
    const {
      stateOptions,
      isFetchingStates,
      onAddressChange,
      onCountryChange,
      onAddressLineOneChange,
    } = useAddressQuestion({ value, onChange });

    const searchOptions = value?.country
      ? {
          componentRestrictions: {
            country: getCountryCode(value?.country),
          },
        }
      : {
          componentRestrictions: {
            country: "IN",
          },
        };

    const getLabelStyles = (theme: any, required?: boolean) => {
      return {
        color: theme?.styles?.description,
        fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
        fontSize: theme?.styles?.questionSize === "XS" 
          ? "0.875rem" 
          : "1.125em",
        fontStyle: "normal" as const,
        fontWeight: theme?.styles?.questionSize === "XS" ? 400 : 400,
        lineHeight: "1.5em",
      };
    };

    const placeholderColor = theme?.styles?.description;
    const placeholderClass = "placeholder:opacity-90 placeholder-[color:var(--address-placeholder)]";
    const disabledOpacityClass = "disabled:!opacity-90";

    return (
      <div
        className="flex flex-col gap-6 overflow-auto"
        style={{ ["--address-placeholder" as string]: placeholderColor }}
      >
        <div className="w-full flex flex-col gap-2">
          <span
            style={getLabelStyles(theme, settings?.fullName)}
            data-testid="address-full-name-label"
          >
            Full Name{settings?.fullName && <span className="text-destructive ml-1">*</span>}
          </span>
          <Input
            autoFocus={autoFocus}
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            value={value?.fullName || ""}
            onChange={(e) => onAddressChange("fullName", e.target.value)}
            required={settings?.fullName}
            disabled={isCreator}
            data-testid="full-name-text-field"
            className={cn(
              "w-full border-0 border-b-2 rounded-none px-0 py-[0.625em]",
              "bg-transparent focus-visible:ring-0 focus-visible:border-b-primary",
              "h-14",
              placeholderClass,
              disabledOpacityClass
            )}
            style={{
              borderBottom: `1px solid ${theme?.styles?.buttons}`,
              fontSize: "1.15em",
              fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
              color: theme?.styles?.buttons,
            }}
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <span
            style={getLabelStyles(theme, settings?.country)}
            data-testid="address-country-label"
          >
            Country or Region{settings?.country && <span className="text-destructive ml-1">*</span>}
          </span>
          <FreeSoloAutocomplete
            options={Object.keys(countries).map((key) => countries[key].countryName)}
            value={value?.country || ""}
            onChange={(e, selectedOption) => {
              onCountryChange(e, selectedOption);
            }}
            searchable={true}
            disabled={isCreator}
            placeholder="Select country"
            placeholderColor={placeholderColor}
            viewPort={viewPort}
            textFieldProps={{
              placeholder: "Select country",
              inputProps: {
                "data-testid": "address-country-input",
              },
              onChange: (e) => {
                const syntheticEvent = {
                  target: { value: e.target.value },
                  type: "change",
                  preventDefault: () => {},
                  stopPropagation: () => {},
                };
                onCountryChange(syntheticEvent, e.target.value);
              },
            }}
            className={cn(
              "w-full border-0 border-b-2 rounded-none bg-transparent",
              "focus-visible:ring-0 focus-visible:border-b-primary h-14",
              "placeholder:!opacity-90 placeholder:![color:var(--address-placeholder)]",
              "disabled:!opacity-90"
            )}
            style={{
              fontSize: "1.15em",
              fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
              borderBottom: `1px solid ${theme?.styles?.buttons}`,
              color: theme?.styles?.buttons,
            }}
            slotProps={{
              paper: {
                style: {
                  fontSize: "1.15em",
                  fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
                  marginBottom: "0.5em",
                },
              },
            }}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <span
            style={getLabelStyles(theme, settings?.addressLineOne)}
            data-testid="address-line-one-label"
          >
            Address Line 1{settings?.addressLineOne && <span className="text-destructive ml-1">*</span>}
          </span>
          {!isCreator && ENV.GOOGLE_MAPS_API_KEY ? (
            <LocationSearchInput
              apiKey={ENV.GOOGLE_MAPS_API_KEY}
              onPlaceSelected={onAddressLineOneChange}
              placeholder="65 Hansen Way"
              defaultValue={value?.addressLineOne}
              searchOptions={searchOptions}
              theme={theme}
            />
          ) : (
            <Input
              name="addressLineOne"
              type="text"
              placeholder="65 Hansen Way"
              value={value?.addressLineOne || ""}
              onChange={(e) => onAddressChange("addressLineOne", e.target.value)}
              required={settings?.addressLineTwo}
              disabled={isCreator}
              data-testid="address-line-one-text-field"
              className={cn(
                "w-full border-0 border-b-2 rounded-none px-0 py-[0.625em]",
                "bg-transparent focus-visible:ring-0 focus-visible:border-b-primary",
                "h-14",
                placeholderClass,
                disabledOpacityClass
              )}
              style={{
                borderBottom: `1px solid ${theme?.styles?.buttons}`,
                fontSize: "1.15em",
                fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
                color: theme?.styles?.buttons,
              }}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-2">
          <span
            style={getLabelStyles(theme, settings?.addressLineTwo)}
            data-testid="address-line-two-label"
          >
            Address Line 2{settings?.addressLineTwo && <span className="text-destructive ml-1">*</span>}
          </span>
          <Input
            name="addressLineTwo"
            type="text"
            placeholder="Apartment 4"
            value={value?.addressLineTwo || ""}
            onChange={(e) => onAddressChange("addressLineTwo", e.target.value)}
            required={settings?.addressLineTwo}
            disabled={isCreator}
            data-testid="address-line-two-text-field"
            className={cn(
              "w-full border-0 border-b-2 rounded-none px-0 py-[0.625em]",
              "bg-transparent focus-visible:ring-0 focus-visible:border-b-primary",
              "h-14",
              placeholderClass,
              disabledOpacityClass
            )}
            style={{
              borderBottom: `1px solid ${theme?.styles?.buttons}`,
              fontSize: "1.15em",
              fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
              color: theme?.styles?.buttons,
            }}
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <span
            style={getLabelStyles(theme, settings?.city)}
            data-testid="address-city-label"
          >
            City/Town{settings?.city && <span className="text-destructive ml-1">*</span>}
          </span>
          <Input
            name="city"
            type="text"
            placeholder="Palo Alto"
            value={value?.city || ""}
            onChange={(e) => onAddressChange("city", e.target.value)}
            required={settings?.city}
            disabled={isCreator}
            data-testid="city-text-field"
            className={cn(
              "w-full border-0 border-b-2 rounded-none px-0 py-[0.625em]",
              "bg-transparent focus-visible:ring-0 focus-visible:border-b-primary",
              "h-14",
              placeholderClass,
              disabledOpacityClass
            )}
            style={{
              borderBottom: `1px solid ${theme?.styles?.buttons}`,
              fontSize: "1.15em",
              fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
              color: theme?.styles?.buttons,
            }}
          />
        </div>
        <div
          className={cn(
            "flex gap-2",
            (viewPort === ViewPort.MOBILE || mode === Mode.CHAT)
              ? "flex-col"
              : "flex-row"
          )}
        >
          <div className="w-full flex flex-col gap-2">
            <span
              style={getLabelStyles(theme, settings?.zipCode)}
              data-testid="address-zip-code-label"
            >
              Zip/Post Code{settings?.zipCode && <span className="text-destructive ml-1">*</span>}
            </span>
            <Input
              name="zipCode"
              type="text"
              placeholder="94304"
              value={value?.zipCode || ""}
              onChange={(e) => {
                const _value = e.target.value;
                if (/^\d*$/.test(_value)) {
                  onAddressChange("zipCode", _value);
                }
              }}
              required={settings?.state}
              disabled={isCreator}
              data-testid="zip-code-number-field"
              className={cn(
                "w-full border-0 border-b-2 rounded-none px-0 py-[0.625em]",
                "bg-transparent focus-visible:ring-0 focus-visible:border-b-primary",
                "h-14",
                placeholderClass,
                disabledOpacityClass
              )}
              style={{
                borderBottom: `1px solid ${theme?.styles?.buttons}`,
                fontSize: "1.15em",
                fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
                color: theme?.styles?.buttons,
              }}
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <span
              style={getLabelStyles(theme, settings?.state)}
              data-testid="address-state-label"
            >
              State/Region/Province{settings?.state && <span className="text-destructive ml-1">*</span>}
            </span>
            <FreeSoloAutocomplete
              options={value?.country ? stateOptions : []}
              value={value?.state || ""}
              onChange={(e, selectedOption) => {
                onAddressChange("state", selectedOption);
              }}
              searchable={true}
              disabled={isFetchingStates || isCreator}
              placeholder={isFetchingStates ? "Fetching states..." : "Select state"}
              placeholderColor={placeholderColor}
              viewPort={viewPort}
              textFieldProps={{
                placeholder: isFetchingStates
                  ? "Fetching states..."
                  : "Select state",
                inputProps: {
                  "data-testid": "address-state-input",
                },
                onChange: (e) => {
                  onAddressChange("state", e.target.value);
                },
              }}
              className={cn(
                "w-full border-0 border-b-2 rounded-none bg-transparent",
                "focus-visible:ring-0 focus-visible:border-b-primary h-14",
                "placeholder:!opacity-90 placeholder:![color:var(--address-placeholder)]",
                "disabled:!opacity-90"
              )}
              style={{
                fontSize: "1.15em",
                fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
                borderBottom: `1px solid ${theme?.styles?.buttons}`,
                color: theme?.styles?.buttons,
              }}
              slotProps={{
                paper: {
                  style: {
                    fontSize: "1.15em",
                    fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
                    marginBottom: "0.5em",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);
