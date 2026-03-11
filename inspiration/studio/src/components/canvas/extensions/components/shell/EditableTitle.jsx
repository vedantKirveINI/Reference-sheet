import React, { useState, useRef, useEffect, useCallback } from "react";
import { Info, Pencil, Check, X } from "lucide-react";
import Lottie from "lottie-react";
import animationData from "../../../assets/lotties/premium.json";
import "./extension-shell.css";

const EditableTitle = ({
  title = {},
  node = {},
  showEditButton = true,
  onTitleChange = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title.name || "");
  const inputRef = useRef(null);
  const showSubtitle = node?.name && node.name !== title?.name?.trim();

  useEffect(() => {
    setEditValue(title.name || "");
  }, [title.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed.length <= 40) {
      onTitleChange({ name: trimmed });
    }
    setIsEditing(false);
  }, [editValue, onTitleChange]);

  const handleCancel = useCallback(() => {
    setEditValue(title.name || "");
    setIsEditing(false);
  }, [title.name]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

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
            {isEditing ? (
              <div className="extension-title-inline-edit">
                <input
                  ref={inputRef}
                  type="text"
                  className="extension-title-inline-input"
                  value={editValue}
                  onChange={(e) => {
                    if (e.target.value.length <= 40) {
                      setEditValue(e.target.value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  data-testid="node-title-inline-input"
                />
                <div className="extension-title-inline-actions">
                  <button
                    type="button"
                    className="extension-title-inline-btn extension-title-inline-btn-save"
                    onClick={handleSave}
                    onMouseDown={(e) => e.preventDefault()}
                    data-testid="node-title-save-btn"
                  >
                    <Check className="extension-header-icon-sm" />
                  </button>
                  <button
                    type="button"
                    className="extension-title-inline-btn extension-title-inline-btn-cancel"
                    onClick={handleCancel}
                    onMouseDown={(e) => e.preventDefault()}
                    data-testid="node-title-cancel-btn"
                  >
                    <X className="extension-header-icon-sm" />
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                    onClick={() => setIsEditing(true)}
                    data-testid="node-drawer-edit-icon"
                  >
                    <Pencil className="extension-header-icon-sm" />
                  </button>
                )}
              </>
            )}
          </div>
          {showSubtitle && !isEditing && (
            <span
              className="extension-header-subtitle"
              data-testid="node-drawer-subtitle"
            >
              {node.name}
            </span>
          )}
        </div>
      </div>

      {title?.premium && !isEditing && (
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

export default EditableTitle;
