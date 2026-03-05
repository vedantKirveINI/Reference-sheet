import { useEffect, useState } from "react";
import { toString } from "../utils";

interface UseAddressQuestionProps {
  value: any;
  onChange: (value: any) => void;
}

export const useAddressQuestion = ({
  value,
  onChange,
}: UseAddressQuestionProps) => {
  const [stateOptions, setStateOptions] = useState<string[]>([]);
  const [isFetchingStates, setIsFetchingStates] = useState<boolean>(false);

  const onAddressChange = (key: string, newValue: any) => {
    const updatedAddress = { ...value, [key]: newValue };
    const _addressString = toString(updatedAddress);
    onChange({ ...updatedAddress, __to_string: _addressString });
  };

  const onAddressLineOneChange = async (selectedOption: any) => {
    try {
      const addressComponents = selectedOption?.address_components || [];

      const state =
        addressComponents.find((c) =>
          c?.types?.includes?.("administrative_area_level_1")
        )?.long_name ||
        value?.state ||
        "";
      const city =
        addressComponents.find((c) => c?.types?.includes?.("locality"))
          ?.long_name ||
        value?.city ||
        "";
      const zipCode =
        addressComponents.find((c) => c?.types?.includes?.("postal_code"))
          ?.long_name ||
        value?.zipCode ||
        "";

      const updatedAddress = {
        ...value,
        addressLineOne: selectedOption?.formatted_address,
        state: state,
        city: city,
        zipCode: zipCode,
      };
      const _addressString = toString(updatedAddress);
      onChange({
        ...updatedAddress,
        __to_string: _addressString,
      });
    } catch (error) {
    }
  };

  const fetchStates = async (country: string) => {
    setIsFetchingStates(true);
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country }),
        }
      );
      const data = await response.json();
      if (data?.data?.states) {
        setStateOptions(data.data.states.map((s) => s.name));
      }
    } catch (error) {
      setStateOptions([]);
    } finally {
      setIsFetchingStates(false);
    }
  };

  const onCountryChange = async (_: any, selectedCountry: string) => {
    const updatedAddress = {
      ...value,
      country: selectedCountry,
      state: "",
    };
    const _addressString = toString(updatedAddress);
    onChange({ ...updatedAddress, __to_string: _addressString });

    setStateOptions([]);
    if (selectedCountry) {
      await fetchStates(selectedCountry);
    }
  };

  // on mount check if we have country fetch the states
  useEffect(() => {
    if (value?.country) {
      fetchStates(value?.country);
    }
  }, []);

  return {
    stateOptions,
    isFetchingStates,
    onAddressChange,
    onCountryChange,
    onAddressLineOneChange,
  };
};
