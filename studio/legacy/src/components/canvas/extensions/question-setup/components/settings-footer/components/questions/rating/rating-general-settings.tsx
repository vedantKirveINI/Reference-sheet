/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import QuestionAlignment from "../../common-settings/alignment";
import SwitchOption from "../../common-settings/switch";
import { RATING_OPTIONS } from "../../../constants/constants";
import { RATING_EMOJIS } from "@oute/oute-ds.core.constants";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
import { ODSIcon as Icon } from "@src/module/ods";
import { SettingsTextField } from "../../common-settings/settings-textfield";

interface RatingSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment: boolean;
}

const RatingGeneralSettings = ({
  onChange,
  question,
  mode,
  disableQuestionAlignment,
}: RatingSettingsProps) => {
  const settings = question?.settings;
  const maxRate = settings?.maxRating;
  const defaultRating = settings?.defaultRating;

  const filteredMaxRating = RATING_OPTIONS.filter(
    (option) => Number(option) <= maxRate
  );

  const ICON_OPTIONS = Object.entries(RATING_EMOJIS).map(
    ([id, { label, emoji }]) => ({
      id,
      label,
      emoji,
    })
  );

  const updateSettings = (key: string, value: any) => {
    let updatedSettings = { ...settings, [key]: value };

    if (key === "maxRating") {
      const newMax = value;
      const currentDefault = settings?.defaultRating;

      if (currentDefault >= newMax) {
        updatedSettings.defaultRating = newMax;
      }
    }

    onChange?.({ settings: updatedSettings });
  };

  // const updateSettings = (key: string, value: any) => {
  //   onChange?.({ settings: { ...settings, [key]: value } });
  // };

  return (
    <>
      <div css={styles.container} data-testid="rating-general-settings">
        <div css={styles.wrapperContainer}>
          <QuestionAlignment
            settings={settings}
            onChange={updateSettings}
            style={{ width: "100%" }}
            mode={mode}
            disabled={disableQuestionAlignment}
          />
          <SwitchOption
            key="required-required"
            variant="black"
            title="Required"
            styles={{ width: "100%" }}
            checked={settings?.required}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              updateSettings("required", event.target.checked)
            }
            dataTestId="question-settings-required-toggle"
          />
          <CTAEditor />
        </div>

        <div css={styles.wrapperContainer}>
          <DropdownV2
            label="Default Rating"
            variant="black"
            value={settings?.defaultRating}
            options={filteredMaxRating}
            onChange={(value) => {
              updateSettings("defaultRating", value);
            }}
            isOptionEqualToValue={(option, value) => {
              return option === value;
            }}
            selecOnFocus={false}
            placeholder="Select value"
            dataTestId="default-rating"
            clearOnEscape
            disableClearable={false}
          />

          <DropdownV2
            label="Max Rating"
            variant="black"
            value={settings?.maxRating}
            options={RATING_OPTIONS}
            onChange={(value) => {
              updateSettings("maxRating", value);
            }}
            defaultValue={Number(settings?.maxRating)}
            isOptionEqualToValue={(option, value) => {
              return option === value;
            }}
            selecOnFocus={false}
            placeholder="Select value"
            dataTestId="max-rating"
          />

          <DropdownV2
            variant="black"
            value={
              ICON_OPTIONS.find(
                (o) => o.label === RATING_EMOJIS[settings?.ratingEmoji]?.label
              ) ?? null
            }
            options={ICON_OPTIONS}
            onChange={(option) => {
              updateSettings("ratingEmoji", option?.id ?? null);
            }}
            getOptionLabel={(option) => option?.label ?? ""}
            isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
            renderOption={(props, option, state) => (
              <li
                {...props}
                key={option.id}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <Icon
                  outeIconName={option.emoji}
                  outeIconProps={{
                    "data-testid": `${option.label}`,
                    sx: {
                      color: state.selected ? "#fff" : "#212121", // white if selected,
                    },
                  }}
                />
                <span>{option.label}</span>
              </li>
            )}
            renderInput={(params) => {
              const selected = params.inputProps?.value;
              const chosen = ICON_OPTIONS.find((o) => o.label === selected);

              return (
                <SettingsTextField
                  {...params}
                  label="Rating Emoji"
                  className="black"
                  InputProps={{
                    ...params.InputProps,
                    "data-testid": "rating-emoji",
                    startAdornment: chosen ? (
                      <Icon
                        outeIconName={chosen.emoji}
                        outeIconProps={{
                          sx: {
                            color: "#212121",
                          },
                        }}
                      />
                    ) : null,
                  }}
                />
              );
            }}
            selecOnFocus={false}
            placeholder="Select value"
          />
        </div>
      </div>
    </>
  );
};

export default RatingGeneralSettings;
