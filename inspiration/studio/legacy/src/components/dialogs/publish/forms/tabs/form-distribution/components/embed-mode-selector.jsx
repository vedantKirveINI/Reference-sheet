import { useCallback } from "react";
import { useFormPublishContext } from "../../../../hooks/use-form-publish-context";
import { EMBED_MODES } from "../../../../constants";
import classes from "./embed-mode-selector.module.css";

const embedOptions = [
  {
    id: EMBED_MODES.FULL_PAGE,
    label: "Full Page",
    icon: (
      <div className={classes.iconContainer}>
        <div className={classes.fullPageIcon} />
      </div>
    ),
  },
  {
    id: EMBED_MODES.STANDARD,
    label: "Standard",
    icon: (
      <div className={classes.iconContainer}>
        <div className={classes.standardIcon}>
          <div className={classes.standardBar1} />
          <div className={classes.standardBar2} />
          <div className={classes.standardBar3} />
        </div>
      </div>
    ),
  },
  {
    id: EMBED_MODES.POPUP,
    label: "Pop up",
    icon: (
      <div className={classes.iconContainer}>
        <div className={classes.popupIcon} />
      </div>
    ),
  },
  {
    id: EMBED_MODES.SLIDER,
    label: "Slider",
    icon: (
      <div className={classes.iconContainer}>
        <div className={classes.sliderIcon} />
      </div>
    ),
  },
  {
    id: EMBED_MODES.POPOVER,
    label: "Popover",
    icon: (
      <div className={classes.iconContainer}>
        <div className={classes.popoverIcon} />
        <div className={classes.popoverDot} />
      </div>
    ),
  },
  {
    id: EMBED_MODES.SIDE_TAB,
    label: "Side tab",
    icon: (
      <div className={classes.iconContainer}>
        <div className={classes.sideTabIcon}>
          <div className={classes.sideTabBar} />
          <div className={classes.sideTabMain} />
        </div>
      </div>
    ),
  },
];

const EmbedModeSelector = () => {
  const { embedMode, setEmbedMode } = useFormPublishContext();

  const handleOptionClick = useCallback(
    (optionId) => {
      setEmbedMode(optionId);
    },
    [setEmbedMode],
  );

  return (
    <div className={classes.container} data-testid="embed-mode-selector">
      <div className={classes.header}>
        <h3 className={classes.title}>Embed Mode</h3>
        <p className={classes.description}>
          Please choose the view in which you would like the form to be shared.
        </p>
      </div>

      <div className={classes.optionsContainer}>
        {embedOptions.map((option) => (
          <div
            key={option.id}
            className={`${classes.option} ${
              embedMode === option.id ? classes.selected : ""
            }`}
            onClick={() => handleOptionClick(option.id)}
            data-testid={`embed-option-${option.id}`}
          >
            <div className={classes.iconWrapper}>{option.icon}</div>
            <span className={classes.optionLabel}>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmbedModeSelector;
