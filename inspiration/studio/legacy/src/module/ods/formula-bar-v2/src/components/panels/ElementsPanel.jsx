import React, { useState, useMemo, useCallback } from "react";
import classes from './ElementsPanel.module.css';

const CATEGORY_ICONS = {
  Properties: '◉',
  'Built-ins': '#',
  Arithmetic: '±',
  'Text & Binary': 'Aa',
  Logical: '⊃',
  'Date & Time': '🕐',
  Array: '[]',
  Other: '⋯',
};

const TYPE_ICONS = {
  text: 'Aa',
  number: '#',
  checkbox: '☑',
  select: '▼',
  date: '📅',
  person: '👤',
  relation: '↗',
  formula: 'Σ',
  OPERATORS: '#',
  COMPARISON: '☑',
  LOGICAL: '☑',
  BOOLEAN: '☑',
  TERNARY: '?:',
  FUNCTIONS: 'ƒ',
};

const ElementsPanel = ({
  elements = {},
  onElementClick = () => {},
  onElementInsert = () => {},
  selectedElement = null,
}) => {
  const [expandedCategories, setExpandedCategories] = useState({
    Properties: true,
    'Built-ins': true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const groupedElements = useMemo(() => {
    const groups = {};

    if (elements.properties?.length > 0) {
      groups['Properties'] = elements.properties;
    }

    if (elements.builtIns?.length > 0) {
      groups['Built-ins'] = elements.builtIns;
    }

    const functionCategories = {};
    elements.functions?.forEach(fn => {
      const cat = fn.category || 'Other';
      if (!functionCategories[cat]) {
        functionCategories[cat] = [];
      }
      functionCategories[cat].push(fn);
    });

    Object.keys(functionCategories).forEach(cat => {
      groups[cat] = functionCategories[cat];
    });

    return groups;
  }, [elements]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedElements;

    const filtered = {};
    const term = searchTerm.toLowerCase();

    Object.entries(groupedElements).forEach(([category, items]) => {
      const matchedItems = items.filter(item => {
        const label = (item.label || item.value || item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        return label.includes(term) || desc.includes(term);
      });
      if (matchedItems.length > 0) {
        filtered[category] = matchedItems;
      }
    });

    return filtered;
  }, [groupedElements, searchTerm]);

  const handleItemClick = useCallback((item) => {
    onElementClick(item);
  }, [onElementClick]);

  const handleItemDoubleClick = useCallback((item) => {
    onElementInsert(item);
  }, [onElementInsert]);

  const handleInsertClick = useCallback((e, item) => {
    e.stopPropagation();
    onElementInsert(item);
  }, [onElementInsert]);

  const renderIcon = (item) => {
    const type = item.type || item.subCategory || 'text';
    const icon = TYPE_ICONS[type] || '◉';
    return <span className={classes.itemIcon}>{icon}</span>;
  };

  const isSelected = (item) => {
    if (!selectedElement) return false;
    return (item.value === selectedElement.value && item.category === selectedElement.category) ||
           (item.name === selectedElement.name);
  };

  return (
    <div className={classes.panel}>
      <div className={classes.searchContainer}>
        <input
          type="text"
          className={classes.searchInput}
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className={classes.clearSearch}
            onClick={() => setSearchTerm('')}
          >
            ×
          </button>
        )}
      </div>

      <div className={classes.categoriesList}>
        {Object.entries(filteredGroups).map(([category, items]) => (
          <div key={category} className={classes.categorySection}>
            <button
              className={classes.categoryHeader}
              onClick={() => toggleCategory(category)}
            >
              <span className={classes.categoryIcon}>
                {CATEGORY_ICONS[category] || '◉'}
              </span>
              <span className={classes.categoryName}>{category}</span>
              <span className={classes.categoryCount}>{items.length}</span>
              <span className={`${classes.expandIcon} ${expandedCategories[category] ? classes.expanded : ''}`}>
                ›
              </span>
            </button>

            {expandedCategories[category] && (
              <div className={classes.itemsList}>
                {items.map((item, index) => (
                  <div
                    key={`${item.value || item.name}-${index}`}
                    className={`${classes.item} ${isSelected(item) ? classes.selected : ''}`}
                    onClick={() => handleItemClick(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    {renderIcon(item)}
                    <span className={classes.itemLabel}>
                      {item.label || item.value || item.name}
                    </span>
                    <button
                      className={classes.insertButton}
                      onClick={(e) => handleInsertClick(e, item)}
                      title="Insert"
                    >
                      ↵
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {Object.keys(filteredGroups).length === 0 && (
          <div className={classes.noResults}>
            No matching elements found
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementsPanel;
