import { useState } from "react";
// import Accordion from "oute-ds-accordion";
// import { ODSLabel as Label } from '@src/module/ods';
import { ODSAccordion as Accordion, ODSLabel as Label } from "@src/module/ods";
import styles from "./CommonTestResponseModule.module.css";

// Helper function to format key names for display
const formatKeyName = (key) => {
  // Handle empty or invalid keys
  if (!key || typeof key !== "string") return "";

  // Replace common delimiters with spaces and handle camelCase
  const processed = key
    // Handle camelCase: someKeyHere -> some Key Here
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // Replace common delimiters with spaces
    .replace(/[-_.]+/g, " ")
    // Remove any other special characters
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    // Remove extra spaces
    .replace(/\s+/g, " ")
    .trim();

  // Capitalize each word
  return processed
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to check if value is a URL or email
const isLink = (value) => {
  if (typeof value !== "string") return false;

  // Only treat as link if it's a standalone email or URL
  // Not if it's part of a larger text
  const isStandaloneValue = !value.includes("\n") && value.trim() === value;

  if (!isStandaloneValue) return false;

  // Check for URLs
  if (value.startsWith("http")) return true;

  // Check for standalone email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

// Helper function to check if array contains only primitive values
const isSimpleArray = (arr) => {
  return arr.every((item) => typeof item !== "object" || item === null);
};

// Helper function to get type name
const getTypeName = (value) => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return typeof value;
};

// Helper function to render values
const renderValue = (value) => {
  if (value === null || value === undefined) {
    return <span className={styles.mutedText}>None</span>;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (isLink(value)) {
    const href = value.includes("@") ? `mailto:${value}` : value;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        {value}
      </a>
    );
  }

  if (typeof value === "string") {
    // Check if string contains newlines or is multiline
    if (value.includes("\n") || /\r|\r\n/.test(value)) {
      return (
        <div className={styles.multilineText}>
          {value.split(/\n|\r|\r\n/).map((line, index, array) => (
            <div key={index} className={styles.textLine}>
              {line || "\u00A0"}
            </div>
          ))}
        </div>
      );
    }
    return <div className={styles.singleLineText}>{value}</div>;
  }

  return String(value);
};

// Helper function to render simple arrays
const renderSimpleArray = (arr) => {
  return (
    <ul className={styles.simpleList}>
      {arr.map((item, index) => (
        <li key={index}>
          <span>{renderValue(item)}</span>
        </li>
      ))}
    </ul>
  );
};

// Update the renderNestedObject function to use Accordion for objects
const renderNestedObject = (data, level = 0) => {
  if (typeof data !== "object" || data === null) {
    return renderValue(data);
  }

  // For nested objects, use accordion
  if (!Array.isArray(data) && typeof data === "object") {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return (
          <Accordion
            key={key}
            className={styles.nestedAccordion}
            title={
              <div className={styles.nestedHeaderContent}>
                <span className={styles.nestedKey}>{formatKeyName(key)}</span>
                <span className={styles.nestedBadge}>
                  {Array.isArray(value)
                    ? `${value.length} items`
                    : `${Object.keys(value).length} fields`}
                </span>
              </div>
            }
            content={renderNestedObject(value, level + 1)}
            summaryProps={{
              className: styles.nestedAccordionSummary,
              sx: {
                ".MuiAccordionSummary-expandIconWrapper": {
                  transform: "rotate(-90deg)",
                  "&.Mui-expanded": {
                    transform: "rotate(0deg)",
                  },
                },
              },
            }}
            detailsProps={{ className: styles.nestedAccordionDetails }}
          />
        );
      }

      // For primitive values, show key-value pair
      return (
        <div key={key} className={styles.nestedField}>
          <div className={styles.nestedLine}>
            <span className={styles.nestedKey}>{formatKeyName(key)}:</span>
            <span className={styles.nestedValue}>{renderValue(value)}</span>
          </div>
        </div>
      );
    });
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (isSimpleArray(data)) {
      return renderSimpleArray(data);
    }

    return (
      <div className={styles.objectContent}>
        {data.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardContent}>{renderNestedObject(item)}</div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Main recursive component to render any data structure
const RecursiveAccordion = ({ data }) => {
  // Handle primitive values
  if (typeof data !== "object" || data === null) {
    return renderValue(data);
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (isSimpleArray(data)) {
      return renderSimpleArray(data);
    }

    return (
      <div className={styles.objectContent}>
        {data.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardContent}>{renderNestedObject(item)}</div>
          </div>
        ))}
      </div>
    );
  }

  // Handle objects
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>{renderNestedObject(data)}</div>
    </div>
  );
};

const CommonTestResponseModule = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handle primitive values at the top level
  if (typeof data !== "object" || data === null) {
    return (
      <div className={styles.container}>
        <div className={styles.primitiveCard}>
          <div className={styles.primitiveHeader}>
            <div className={styles.primitiveTypeInfo}>
              <span className={styles.primitiveTypeName}>
                {getTypeName(data)}
              </span>
            </div>
          </div>
          <div className={styles.primitiveContent}>{renderValue(data)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.accordionWrapper}>
        {Object.entries(data).map(([key, value]) => (
          <Accordion
            key={key}
            className={styles.muiAccordion}
            expanded={expanded === key}
            onChange={handleChange(key)}
            title={
              <div className={styles.headerContent}>
                <Label variant="capital">{formatKeyName(key)}</Label>
                {typeof value === "object" && value !== null && (
                  <span className={styles.badge}>
                    {Array.isArray(value)
                      ? `${value.length} items`
                      : `${Object.keys(value).length} fields`}
                  </span>
                )}
              </div>
            }
            content={<RecursiveAccordion data={value} />}
            summaryProps={{
              className: styles.muiAccordionSummary,
              sx: {
                ".MuiAccordionSummary-expandIconWrapper": {
                  transform: "rotate(-90deg)",
                  "&.Mui-expanded": {
                    transform: "rotate(0deg)",
                  },
                },
              },
            }}
            detailsProps={{ className: styles.muiAccordionDetails }}
          />
        ))}
      </div>
    </div>
  );
};

export default CommonTestResponseModule;
