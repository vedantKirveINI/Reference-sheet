import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
// import { ODSIcon as Icon } from "@src/module/ods";
import { ODSIcon as Icon } from "../ods";
import getCategoryLabelFromSectionId from "./utils/getCategoryLabelFromSectionId";
import snakeCase from "lodash/snakeCase";
import debounce from "lodash/debounce";
import NodesContainer from "./NodesContainer";
import Fuse from "fuse.js";
import Note from "./component/Note";
import RequestIntegration from "./component/RequestIntegration";
import SidebarNav from "./component/SidebarNav";
import SuggestedNodes from "./component/SuggestedNodes";
import RecipeSnippets from "./component/RecipeSnippets";
import ContextualSuggestions from "./component/ContextualSuggestions";
import ViewModeToggle from "./component/ViewModeToggle";
import { getRecentNodes, addRecentNode } from "./utils/recentNodes";
import styles from "./styles.module.css";
const TRIGGER_SEARCH_CATEGORIES = [
  "trigger",
  "manual",
  "timebased",
  "table",
  "webhook",
  "form",
  "appbased",
];

const INTENT_KEYWORDS = {
  "send email": ["SEND_EMAIL", "EMAIL"],
  "send notification": ["SEND_EMAIL", "SLACK", "WEBHOOK"],
  "make api call": ["HTTP", "API"],
  "call api": ["HTTP", "API"],
  "fetch data": ["HTTP", "FIND_ALL"],
  "transform data": ["TRANSFORMER", "PARSER"],
  "check condition": ["IFELSE_V2", "IF_ELSE"],
  "loop through": ["ITERATOR", "FOR_EACH"],
  "iterate": ["ITERATOR", "FOR_EACH"],
  "save to database": ["UPSERT", "CREATE", "UPDATE"],
  "store data": ["UPSERT", "CREATE"],
  "query data": ["FIND_ALL", "FIND_ONE"],
  "find records": ["FIND_ALL", "FIND_ONE"],
  "use ai": ["TINY_GPT", "AI"],
  "ai generate": ["TINY_GPT", "AI"],
  "schedule task": ["SCHEDULE_TRIGGER", "TIME"],
  "run on schedule": ["SCHEDULE_TRIGGER", "TIME"],
  "when form submitted": ["FORM_TRIGGER"],
  "when record created": ["TABLE_TRIGGER"],
  "when record updated": ["TABLE_TRIGGER"],
  "slack message": ["SLACK"],
  "post to slack": ["SLACK"],
  "parse json": ["TRANSFORMER", "PARSER"],
  "extract data": ["TRANSFORMER", "PARSER"],
  "combine results": ["AGGREGATOR", "ARRAY_AGGREGATOR"],
  "merge data": ["AGGREGATOR", "ARRAY_AGGREGATOR"],
  "wait": ["DELAY", "WAIT"],
  "delay": ["DELAY", "WAIT"],
};

const PLACEHOLDER_EXAMPLES = [
  "Search nodes or describe what you want to do...",
  "e.g., 'send email when form submitted'",
  "e.g., 'fetch data from API'",
  "e.g., 'loop through records'",
  "e.g., 'check if amount > 1000'",
];

const AddNodeComponent = ({
  tabData = [],
  palette = { background: "#FB6D2B", foreground: "#fff" },
  plan = "basic",
  disabledNodes = [],
  onClick = () => {},
  onSearch = () => {},
  onClose,
  isOpen = false,
  previousNode = null,
}) => {
  const [filteredTabData, setFilteredTabData] = useState(tabData);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [totalResults, setTotalResults] = useState(0);

  const [noteInfo, setNoteInfo] = useState({
    open: false,
    matchedCategory: "",
  });

  const [reqIntegration, setReqIntegration] = useState("");

  const [recentNodes, setRecentNodes] = useState([]);
  const [focusedSection, setFocusedSection] = useState(null);
  const [focusedNodeIndex, setFocusedNodeIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [viewMode, setViewMode] = useState("grid");

  const contentAreaRef = useRef(null);
  const sectionRefs = useRef({});
  const isManualScrollRef = useRef(false);
  const searchInputRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setSearchText("");
      setFilteredTabData(tabData);
      setSelectedCategory("All");
      setFocusedNodeIndex(-1);
      setFocusedSection(null);
      setTotalResults(0);
      setNoteInfo({ open: false, matchedCategory: "" });
      setReqIntegration("");
      
      const recent = getRecentNodes();
      setRecentNodes(recent);
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, tabData]);

  const handleNodeClick = useCallback(
    (node) => {
      addRecentNode(node);
      const updated = getRecentNodes();
      setRecentNodes(updated);
      onClick(node);
    },
    [onClick]
  );

  const categories = useMemo(() => {
    const allCategory = { label: "All" };
    const categoryMap = new Map();
    categoryMap.set("All", allCategory);

    tabData?.forEach((tab) => {
      if (!categoryMap.has(tab.label)) {
        categoryMap.set(tab.label, tab);
      }
    });

    return Array.from(categoryMap.values());
  }, [tabData]);

  const allFlatNodes = useMemo(() => {
    const nodes = [];
    filteredTabData?.forEach((tab) => {
      tab.components?.forEach((component) => {
        nodes.push(component);
      });
    });
    return nodes;
  }, [filteredTabData]);

  const { fuseIndex, allNodesWithCategory } = useMemo(() => {
    const allNodes = [];
    tabData?.forEach((tab) => {
      tab.components?.forEach((component) => {
        allNodes.push({ ...component, _categoryLabel: tab.label });
      });
    });
    
    const fuseOptions = {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "type", weight: 0.2 },
        { name: "meta.search_keys", weight: 0.3 },
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.45,
      isCaseSensitive: false,
      minMatchCharLength: 2,
    };
    
    return {
      fuseIndex: new Fuse(allNodes, fuseOptions),
      allNodesWithCategory: allNodes,
    };
  }, [tabData]);

  const filterNodes = useCallback(
    (searchTextValue) => {
      onSearch(searchTextValue);
      setSearchText(searchTextValue);
      const lowerSearchText = searchTextValue.toLowerCase().trim();
      const removeSpaces = (str) => {
        return str.replace(/\s+/g, "");
      };
      const filterText = removeSpaces(searchTextValue);

      const matchIntentTypes = () => {
        const matches = new Set();
        Object.entries(INTENT_KEYWORDS).forEach(([phrase, types]) => {
          if (lowerSearchText.includes(phrase) || phrase.includes(lowerSearchText)) {
            types.forEach((t) => matches.add(t));
          }
        });
        return Array.from(matches);
      };
      
      const intentTypes = matchIntentTypes();

      if (filterText.length < 5) {
        setNoteInfo({ open: false, matchedCategory: "" });
      } else {
        const matchedCategory = TRIGGER_SEARCH_CATEGORIES.find((item) =>
          item.includes(filterText.toLowerCase())
        );
        setNoteInfo({ open: !!matchedCategory, matchedCategory });
      }

      if (filterText || intentTypes.length > 0) {
        let fuseResults = filterText ? fuseIndex.search(filterText) : [];
        
        if (intentTypes.length > 0) {
          const intentMatches = allNodesWithCategory.filter((node) =>
            intentTypes.some((t) => 
              node.type?.toUpperCase().includes(t) || 
              node.subType?.toUpperCase().includes(t)
            )
          );
          const fuseIds = new Set(fuseResults.map((r) => r.item.type));
          intentMatches.forEach((node) => {
            if (!fuseIds.has(node.type)) {
              fuseResults.push({ item: node, score: 0.3 });
            }
          });
        }

        const resultsByCategory = new Map();
        fuseResults.forEach(({ item }) => {
          const categoryLabel = item._categoryLabel;
          if (!resultsByCategory.has(categoryLabel)) {
            resultsByCategory.set(categoryLabel, []);
          }
          resultsByCategory.get(categoryLabel).push(item);
        });

        const filteredComponents = [];
        let resultCount = 0;

        tabData?.forEach((tab) => {
          const categoryResults = resultsByCategory.get(tab.label);
          if (categoryResults && categoryResults.length > 0) {
            resultCount += categoryResults.length;
            filteredComponents.push({
              ...tab,
              components: categoryResults,
            });
          }
        });

        setTotalResults(resultCount);
        setReqIntegration(filteredComponents.length > 0 ? "bottom" : "top");

        if (filteredComponents.length) {
          setFilteredTabData(filteredComponents);
          setSelectedCategory("All");
          setFocusedNodeIndex(-1);
          return;
        }
      }

      if (!filterText) {
        setReqIntegration("");
        setTotalResults(0);
      }

      setFilteredTabData(tabData);
      setFocusedNodeIndex(-1);
      return;
    },
    [tabData, onSearch, fuseIndex, allNodesWithCategory]
  );

  const debounceSearch = useCallback(debounce(filterNodes, 300), [filterNodes]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchText(value);
    debounceSearch(value);
  }, [debounceSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    filterNodes("");
    searchInputRef.current?.focus();
  }, [filterNodes]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedNodeIndex((prev) => 
        prev < allFlatNodes.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedNodeIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedNodeIndex >= 0) {
        const node = allFlatNodes[focusedNodeIndex];
        if (node) {
          handleNodeClick(node);
        }
      } else if (allFlatNodes.length > 0) {
        handleNodeClick(allFlatNodes[0]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (searchText) {
        handleClearSearch();
      } else if (onClose) {
        onClose();
      }
    }
  }, [allFlatNodes, focusedNodeIndex, handleNodeClick, searchText, handleClearSearch, onClose]);

  const handleSidebarClick = useCallback(({ label }) => {
    const sectionId = `section_${snakeCase(label)}`;

    isManualScrollRef.current = true;
    setSelectedCategory(label);

    if (label === "All" && contentAreaRef.current) {
      contentAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        isManualScrollRef.current = false;
      }, 500);
      return;
    }

    setFocusedSection(sectionId);

    const sectionElement = sectionRefs.current[sectionId];
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        isManualScrollRef.current = false;
      }, 500);
    } else {
      isManualScrollRef.current = false;
    }
  }, []);

  useEffect(() => {
    setFilteredTabData(tabData);
  }, [tabData]);

  useEffect(() => {
    const recent = getRecentNodes();
    setRecentNodes(recent);
  }, []);

  useEffect(() => {
    if (!contentAreaRef.current) return;

    const observerOptions = {
      root: contentAreaRef.current,
      rootMargin: "10px 0px -90% 0px",
      threshold: 0,
    };

    let pendingUpdate = null;
    const debouncedObserverCallback = (entries) => {
      if (isManualScrollRef.current) return;

      if (pendingUpdate) {
        cancelAnimationFrame(pendingUpdate);
      }

      pendingUpdate = requestAnimationFrame(() => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const aTop = a.boundingClientRect.top;
            const bTop = b.boundingClientRect.top;
            return aTop - bTop;
          });

        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          const sectionId = topEntry.target.id;

          const categoryLabel = getCategoryLabelFromSectionId({
            sectionId,
            tabData: filteredTabData,
          });

          if (categoryLabel) {
            setSelectedCategory(categoryLabel);
          }
        }
        pendingUpdate = null;
      });
    };

    const observer = new IntersectionObserver(
      debouncedObserverCallback,
      observerOptions
    );

    const timeoutId = setTimeout(() => {
      Object.values(sectionRefs.current).forEach((section) => {
        if (section) {
          observer.observe(section);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (pendingUpdate) {
        cancelAnimationFrame(pendingUpdate);
      }
      observer.disconnect();
    };
  }, [filteredTabData, tabData, recentNodes]);

  return (
    <div className={styles.container} onKeyDown={handleKeyDown}>
      <div className={styles.mainLayout}>
        <SidebarNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSidebarClick}
        />

        <main className={styles.mainContent}>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <Icon 
                outeIconName="OUTESearchIcon" 
                style={{ color: "#94a3b8", fontSize: "1.25rem" }}
              />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                value={searchText}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                autoFocus
                data-testid="add-node-search-input"
              />
              {searchText ? (
                <button 
                  className={styles.clearButton}
                  onClick={handleClearSearch}
                  type="button"
                  aria-label="Clear search"
                >
                  <Icon outeIconName="OUTECloseIcon" style={{ fontSize: "0.875rem" }} />
                </button>
              ) : (
                <div className={styles.searchShortcut}>
                  <span>⌘</span>
                  <span>K</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.resultsBar}>
            {searchText && totalResults > 0 && (
              <div className={styles.resultsCount}>
                Found <strong>{totalResults}</strong> {totalResults === 1 ? "node" : "nodes"} matching "{searchText}"
              </div>
            )}
            <div className={styles.viewModeWrapper}>
              <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
            </div>
          </div>

          {noteInfo?.open && (
            <div className={styles.noteContainer}>
              <Note noteInfo={noteInfo} />
            </div>
          )}

          {reqIntegration === "top" && (
            <div className={styles.requestIntegrationContainer}>
              <RequestIntegration />
            </div>
          )}

          <div className={styles.contentArea} ref={contentAreaRef}>
            {searchText && totalResults === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🔍</div>
                <h3 className={styles.emptyStateTitle}>No nodes found</h3>
                <p className={styles.emptyStateDescription}>
                  Try a different search term or browse categories on the left
                </p>
              </div>
            )}

            {!searchText && (
              <>
                {previousNode && (
                  <ContextualSuggestions
                    previousNode={previousNode}
                    onNodeClick={handleNodeClick}
                    tabData={tabData}
                  />
                )}
                <SuggestedNodes 
                  onNodeClick={handleNodeClick}
                  recentNodes={recentNodes}
                  tabData={tabData}
                />
                <RecipeSnippets 
                  onRecipeClick={handleNodeClick}
                  tabData={tabData}
                />
              </>
            )}

            {filteredTabData?.length > 0 && (
              <NodesContainer
                nodes={filteredTabData}
                plan={plan}
                disabledNodes={disabledNodes}
                onClick={handleNodeClick}
                recentNodes={recentNodes}
                showSectionHeaders={true}
                sectionRefs={sectionRefs}
                focusedSection={focusedSection}
                searchText={searchText}
                focusedNodeIndex={focusedNodeIndex}
                viewMode={viewMode}
              />
            )}
          </div>

          {reqIntegration === "bottom" && (
            <div className={styles.requestIntegrationContainer}>
              <RequestIntegration reqIntegration={reqIntegration} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AddNodeComponent;
