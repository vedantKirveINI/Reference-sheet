import React from "react";
import { Info, Pencil } from "lucide-react";
import Lottie from "lottie-react";
import animationData from "../../../assets/lotties/premium.json";
import "./extension-shell.css";

const ExtensionHeader = ({
  title = {},
  node = {},
  showEditButton = true,
  onEditClick = () => {},
}) => {
  const showSubtitle = node?.name && node.name !== title?.name?.trim();

  return (
    <div className="extension-header">
      <div className="extension-header-left">
        {title.icon && (
          <div className="extension-header-icon" data-testid="node-drawer-icon">
            <img
              src={title.icon}
              alt=""
              className="extension-header-icon-img"
            />
          </div>
        )}
        <div className="extension-header-text">
          <div className="extension-header-title-row">
            <span
              className="extension-header-title"
              data-testid="node-drawer-title"
            >
              {title.name}
            </span>
            {!!title.hoverDescription && (
              <div className="extension-header-tooltip-wrapper">
                <button
                  type="button"
                  className="extension-header-icon-btn"
                  data-testid="node-drawer-description-icon"
                >
                  <Info className="extension-header-icon-sm" />
                </button>
                <div className="extension-header-tooltip">
                  {title.hoverDescription}
                </div>
              </div>
            )}
            {showEditButton && (
              <button
                type="button"
                className="extension-header-icon-btn"
                onClick={onEditClick}
                data-testid="node-drawer-edit-icon"
              >
                <Pencil className="extension-header-icon-sm" />
              </button>
            )}
          </div>
          {showSubtitle && (
            <span
              className="extension-header-subtitle"
              data-testid="node-drawer-subtitle"
            >
              {node.name}
            </span>
          )}
        </div>
      </div>

      {title?.premium && (
        <div className="extension-header-premium">
          <Lottie
            animationData={animationData}
            loop={true}
            className="extension-header-premium-lottie"
          />
          <span className="extension-header-premium-text">PREMIUM</span>
        </div>
      )}
    </div>
  );
};

export default ExtensionHeader;
