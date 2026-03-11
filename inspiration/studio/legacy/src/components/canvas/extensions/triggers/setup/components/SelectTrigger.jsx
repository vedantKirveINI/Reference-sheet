import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ODSIcon as Icon } from "@src/module/ods";

import { TRIGGER_TYPES } from "../constants/trigger-types";
import styles from "./SelectTrigger.module.css";

const SelectTrigger = ({ 
  onChange = () => {}, 
  selectedType = null,
  showCancel = false,
  onCancel = () => {}
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  const filteredTriggers = useMemo(() => {
    if (!searchQuery.trim()) return TRIGGER_TYPES;
    const query = searchQuery.toLowerCase();
    return TRIGGER_TYPES.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        (node.description || node.hoverDescription || "").toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleKeyDown = useCallback((e) => {
    const len = filteredTriggers.length;
    if (len === 0) return;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % len);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + len) % len);
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < len) {
          onChange(filteredTriggers[focusedIndex]);
        }
        break;
      case "Escape":
        if (showCancel) {
          e.preventDefault();
          onCancel();
        }
        break;
      default:
        break;
    }
  }, [filteredTriggers, focusedIndex, onChange, showCancel, onCancel]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setFocusedIndex(0);
  }, []);

  useEffect(() => {
    if (focusedIndex >= 0 && cardRefs.current[focusedIndex]) {
      cardRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  return (
    <div 
      className={styles.triggerCardsWrapper}
      onKeyDown={handleKeyDown}
      ref={containerRef}
      data-testid="select-trigger-dropdown"
      tabIndex={showCancel ? -1 : 0}
    >
      {showCancel && (
        <div className={styles.triggerCardsHeader}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search triggers..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
            data-testid="select-trigger-search"
          />
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      )}
      <div className={styles.triggerCardsContainer} role="listbox">
        {filteredTriggers.map((node, index) => {
          const isSelected = selectedType === node.type;
          return (
            <div
              key={`${node.name}_${index}`}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`${styles.triggerCard} ${isSelected ? styles.selected : ""} ${focusedIndex === index ? styles.focused : ""}`}
              data-testid={`${node?.name?.toLowerCase()?.split(" ")?.join("-")}-card`}
              onClick={() => onChange(node)}
              onFocus={() => setFocusedIndex(index)}
              role="option"
              aria-selected={isSelected}
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              {isSelected && (
                <div className={styles.selectedIndicator}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="9" fill="#0066ff"/>
                    <path d="M5.5 9L8 11.5L12.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div className={styles.cardHeader}>
                <div className={styles.iconContainer}>
                  <Icon
                    imageProps={{
                      src: node._src,
                      style: { width: "1.75rem", height: "1.75rem" },
                    }}
                  />
                </div>
                <span className={styles.cardTitle}>{node.name}</span>
              </div>
              <span className={styles.cardDescription}>
                {node.description || node.hoverDescription}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectTrigger;
