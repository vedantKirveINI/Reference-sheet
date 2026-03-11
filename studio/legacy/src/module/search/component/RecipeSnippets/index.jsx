import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "../../../ods";
import styles from "./styles.module.css";

const RECIPES = [
  {
    id: "api-transform",
    name: "API Data Pipeline",
    description: "Fetch data from API, transform it, and save to database",
    nodes: [
      { label: "HTTP Request", type: "HTTP" },
      { label: "Transformer", type: "TRANSFORMER" },
      { label: "Create Record", type: "UPSERT" },
    ],
    color: "#3b82f6",
    icon: "OUTEApiIcon",
    popular: true,
  },
  {
    id: "conditional-routing",
    name: "Smart Router",
    description: "Route data based on conditions with multiple branches",
    nodes: [
      { label: "If/Else", type: "IF_ELSE_V2" },
      { label: "Transformer", type: "TRANSFORMER" },
      { label: "HTTP Request", type: "HTTP" },
    ],
    color: "#f59e0b",
    icon: "OUTERouteIcon",
    popular: true,
  },
  {
    id: "batch-processor",
    name: "Batch Processor",
    description: "Process items in bulk with iteration and aggregation",
    nodes: [
      { label: "Iterator", type: "ITERATOR" },
      { label: "Transformer", type: "TRANSFORMER" },
      { label: "Aggregator", type: "ARRAY_AGGREGATOR" },
    ],
    color: "#10b981",
    icon: "OUTEBatchIcon",
    popular: false,
  },
  {
    id: "ai-enrichment",
    name: "AI Enrichment",
    description: "Enhance data with AI-powered analysis and insights",
    nodes: [
      { label: "HTTP Request", type: "HTTP" },
      { label: "TinyGPT", type: "TINY_GPT" },
      { label: "Create Record", type: "UPSERT" },
    ],
    color: "#ec4899",
    icon: "OUTEAiIcon",
    popular: true,
  },
  {
    id: "webhook-handler",
    name: "Webhook Handler",
    description: "Receive webhooks, validate, and trigger actions",
    nodes: [
      { label: "Webhook", type: "WEBHOOK" },
      { label: "If/Else", type: "IF_ELSE_V2" },
      { label: "HTTP Request", type: "HTTP" },
    ],
    color: "#8b5cf6",
    icon: "OUTEWebhookIcon",
    popular: false,
  },
  {
    id: "scheduled-sync",
    name: "Scheduled Sync",
    description: "Sync data between systems on a schedule",
    nodes: [
      { label: "Time Trigger", type: "SCHEDULE_TRIGGER" },
      { label: "Find All", type: "FIND_ALL" },
      { label: "HTTP Request", type: "HTTP" },
      { label: "Update", type: "UPSERT" },
    ],
    color: "#06b6d4",
    icon: "OUTEScheduleIcon",
    popular: false,
  },
];

const RecipeSnippets = ({ isExpanded = false, onRecipeClick, tabData = [] }) => {
  const [showAll, setShowAll] = useState(isExpanded);
  
  const displayedRecipes = showAll ? RECIPES : RECIPES.slice(0, 3);

  const nodesByType = useMemo(() => {
    const map = {};
    tabData?.forEach((tab) => {
      tab.components?.forEach((component) => {
        if (component.type && !map[component.type]) {
          map[component.type] = { ...component, categoryLabel: tab.label };
        }
      });
    });
    return map;
  }, [tabData]);

  const handleRecipeClick = (recipe) => {
    if (!onRecipeClick) return;
    
    const firstNode = recipe.nodes[0];
    const nodeData = nodesByType[firstNode.type];
    
    if (nodeData) {
      onRecipeClick(nodeData, recipe);
    }
  };

  const isRecipeAvailable = (recipe) => {
    return recipe.nodes.some((n) => nodesByType[n.type]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>📋</span>
          <h3 className={styles.headerTitle}>Recipe Templates</h3>
        </div>
        <button 
          className={styles.toggleButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `+${RECIPES.length - 3} more`}
        </button>
      </div>
      
      <p className={styles.subtitle}>
        Pre-built workflow patterns to get you started faster
      </p>
      
      <motion.div className={styles.recipesGrid} layout>
        <AnimatePresence mode="popLayout">
          {displayedRecipes.map((recipe, index) => {
            const available = isRecipeAvailable(recipe);
            return (
              <motion.div
                key={recipe.id}
                className={`${styles.recipeCard} ${available ? styles.clickable : ""}`}
                style={{ "--accent-color": recipe.color }}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
                whileHover={available ? { scale: 1.02, y: -4 } : {}}
                whileTap={available ? { scale: 0.98 } : {}}
                onClick={() => available && handleRecipeClick(recipe)}
                layout
              >
                {recipe.popular && (
                  <span className={styles.popularBadge}>Popular</span>
                )}
                
                <div className={styles.recipeHeader}>
                  <div 
                    className={styles.recipeIcon}
                    style={{ background: `linear-gradient(135deg, ${recipe.color}20 0%, ${recipe.color}10 100%)` }}
                  >
                    <Icon 
                      outeIconName={recipe.icon} 
                      sx={{ color: recipe.color, fontSize: "1.25rem" }}
                    />
                  </div>
                  <div className={styles.recipeInfo}>
                    <span className={styles.recipeName}>{recipe.name}</span>
                    <span className={styles.recipeNodeCount}>
                      {recipe.nodes.length} nodes
                    </span>
                  </div>
                </div>
                
                <p className={styles.recipeDescription}>{recipe.description}</p>
                
                <div className={styles.nodeFlow}>
                  {recipe.nodes.map((node, nodeIndex) => (
                    <React.Fragment key={nodeIndex}>
                      <span 
                        className={`${styles.nodeTag} ${nodesByType[node.type] ? styles.available : styles.unavailable}`}
                      >
                        {node.label}
                      </span>
                      {nodeIndex < recipe.nodes.length - 1 && (
                        <Icon 
                          outeIconName="OUTEArrowRightIcon" 
                          sx={{ color: "#cbd5e1", fontSize: "0.75rem" }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                <div className={styles.useRecipe}>
                  {available ? (
                    <span className={styles.useRecipeActive}>
                      <Icon outeIconName="OUTEAddIcon" sx={{ fontSize: "0.875rem" }} />
                      Use template
                    </span>
                  ) : (
                    <span>Coming soon</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RecipeSnippets;
