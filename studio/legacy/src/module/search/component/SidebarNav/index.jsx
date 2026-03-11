import React from "react";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "../../../ods";
import styles from "./styles.module.css";
import ICON_MAPPING from "../../constant/iconMapping";

const SidebarNav = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarButtons}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.label;

          return (
            <button
              key={category.label}
              className={`${styles.sidebarButton} ${
                isSelected ? styles.sidebarButtonActive : ""
              }`}
              onClick={() => onSelectCategory({ label: category.label })}
              title={category.label}
              data-testid={`sidebar-nav-${category.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon
                imageProps={{
                  src: ICON_MAPPING[category.label],
                }}
              />
              <span
                className={styles.sidebarButtonLabel}
                style={{
                  color: isSelected ? "#333" : "#64748b",
                }}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default SidebarNav;
