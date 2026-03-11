import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getScoutTemplateById, RESEARCH_CATEGORIES, DEFAULT_OUTPUT_TITLES, DEFAULT_OUTPUT_SCHEMA } from "../constants";

const createEmptyFxBlocks = () => ({ type: "fx", blocks: [] });

const normalizeFxBlocks = (value) => {
  if (!value) return createEmptyFxBlocks();
  if (typeof value === "string") {
    return { type: "fx", blocks: [{ type: "PRIMITIVES", value }] };
  }
  if (value.type === "fx" && Array.isArray(value.blocks)) {
    return cloneDeep(value);
  }
  return createEmptyFxBlocks();
};

const getAllResearchPoints = () => {
  const points = {};
  RESEARCH_CATEGORIES.forEach((category) => {
    category.researchPoints.forEach((point) => {
      points[point] = false;
    });
  });
  return points;
};

const getResearchPointsForCategories = (categoryIds) => {
  const points = getAllResearchPoints();
  RESEARCH_CATEGORIES.forEach((category) => {
    if (categoryIds.includes(category.id)) {
      category.researchPoints.forEach((point) => {
        points[point] = true;
      });
    }
  });
  return points;
};

export const useScoutState = (initialData = {}) => {
  // New nodes should show Initialise tab first, not auto-set isFromScratch
  const [name, setName] = useState(initialData.name || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || false
  );

  const [yourCompanyName, setYourCompanyName] = useState(
    normalizeFxBlocks(initialData.yourCompany?.name || initialData.companyName)
  );
  const [yourCompanyDescription, setYourCompanyDescription] = useState(
    normalizeFxBlocks(initialData.yourCompany?.description || initialData.description)
  );
  const [yourCompanyIndustry, setYourCompanyIndustry] = useState(
    normalizeFxBlocks(initialData.yourCompany?.industry || initialData.industry)
  );

  const [targetCompanyName, setTargetCompanyName] = useState(
    normalizeFxBlocks(initialData.targetCompany?.name || initialData.researchCompanyName)
  );
  const [targetCompanyWebsite, setTargetCompanyWebsite] = useState(
    normalizeFxBlocks(initialData.targetCompany?.website || initialData.researchCompanyWebsite)
  );

  const [selectedCategories, setSelectedCategories] = useState(
    initialData.selectedCategories || []
  );

  const [selectedResearchPoints, setSelectedResearchPoints] = useState(
    initialData.selectedResearchPoints || initialData.researchPoints || getAllResearchPoints()
  );

  const [additionalContext, setAdditionalContext] = useState(
    initialData.additionalContext || ""
  );

  const [outputTitle, setOutputTitle] = useState(
    cloneDeep(initialData.outputTitle) || cloneDeep(DEFAULT_OUTPUT_TITLES)
  );

  const [customOutputTitle, setCustomOutputTitle] = useState(
    normalizeFxBlocks(initialData.customOutputTitle)
  );

  const [customResearchPoints, setCustomResearchPoints] = useState(
    normalizeFxBlocks(initialData.customResearchPoints)
  );

  const [outputSchema, setOutputSchema] = useState(() => {
    return cloneDeep(initialData.output) || {};
  });

  const [touched, setTouched] = useState({
    yourCompanyName: false,
    yourCompanyDescription: false,
    yourCompanyIndustry: false,
    targetCompanyName: false,
    researchFocus: false,
  });

  const markFieldTouched = useCallback((fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      yourCompanyName: true,
      yourCompanyDescription: true,
      yourCompanyIndustry: true,
      targetCompanyName: true,
      researchFocus: true,
    });
  }, []);

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);

    const template = getScoutTemplateById(templateId);
    if (template) {
      setSelectedCategories(template.researchCategories);
      setSelectedResearchPoints(getResearchPointsForCategories(template.researchCategories));
      setOutputTitle(DEFAULT_OUTPUT_TITLES);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setSelectedCategories(RESEARCH_CATEGORIES.map((c) => c.id));
    setSelectedResearchPoints(getResearchPointsForCategories(RESEARCH_CATEGORIES.map((c) => c.id)));
    setOutputTitle(DEFAULT_OUTPUT_TITLES);
    setTouched({
      yourCompanyName: false,
      yourCompanyDescription: false,
      yourCompanyIndustry: false,
      targetCompanyName: false,
      researchFocus: false,
    });
  }, []);

  const applySelectedTemplate = useCallback((templateIdOverride) => {
    const targetId = templateIdOverride || selectedTemplateId;
    if (targetId) {
      const template = getScoutTemplateById(targetId);
      if (template) {
        setSelectedCategories(template.researchCategories);
        setSelectedResearchPoints(getResearchPointsForCategories(template.researchCategories));
      }
    }
  }, [selectedTemplateId]);

  const updateYourCompanyName = useCallback((blocks) => {
    setYourCompanyName({ type: "fx", blocks });
  }, []);

  const updateYourCompanyDescription = useCallback((blocks) => {
    setYourCompanyDescription({ type: "fx", blocks });
  }, []);

  const updateYourCompanyIndustry = useCallback((blocks) => {
    setYourCompanyIndustry({ type: "fx", blocks });
  }, []);

  const updateTargetCompanyName = useCallback((blocks) => {
    setTargetCompanyName({ type: "fx", blocks });
  }, []);

  const updateTargetCompanyWebsite = useCallback((blocks) => {
    setTargetCompanyWebsite({ type: "fx", blocks });
  }, []);

  const toggleCategory = useCallback((categoryId) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryId);
      const newCategories = isSelected
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      const category = RESEARCH_CATEGORIES.find((c) => c.id === categoryId);
      if (category) {
        setSelectedResearchPoints((prevPoints) => {
          const newPoints = { ...prevPoints };
          category.researchPoints.forEach((point) => {
            newPoints[point] = !isSelected;
          });
          return newPoints;
        });
      }

      return newCategories;
    });
  }, []);

  const toggleResearchPoint = useCallback((pointId) => {
    setSelectedResearchPoints((prev) => {
      const newPoints = {
        ...prev,
        [pointId]: !prev[pointId],
      };

      // Check if this point belongs to a category and update category selection accordingly
      RESEARCH_CATEGORIES.forEach((category) => {
        if (category.researchPoints.includes(pointId)) {
          const allPointsInCategoryUnchecked = category.researchPoints.every(
            (point) => !newPoints[point]
          );
          const anyPointInCategoryChecked = category.researchPoints.some(
            (point) => newPoints[point]
          );

          setSelectedCategories((prevCategories) => {
            const isCurrentlySelected = prevCategories.includes(category.id);

            if (allPointsInCategoryUnchecked && isCurrentlySelected) {
              // Remove category if all its points are unchecked
              return prevCategories.filter((id) => id !== category.id);
            } else if (anyPointInCategoryChecked && !isCurrentlySelected) {
              // Add category if any of its points are checked
              return [...prevCategories, category.id];
            }
            return prevCategories;
          });
        }
      });

      return newPoints;
    });
  }, []);

  const toggleOutputTitle = useCallback((titleId) => {
    setOutputTitle((prev) => ({
      ...prev,
      [titleId]: !prev[titleId],
    }));
  }, []);

  const updateCustomOutputTitle = useCallback((blocks) => {
    setCustomOutputTitle({ type: "fx", blocks });
  }, []);

  const updateCustomResearchPoints = useCallback((blocks) => {
    setCustomResearchPoints({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema({ output: { schema } })
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    const touchedErrors = {};

    if (!yourCompanyName?.blocks?.length) {
      errors.yourCompanyName = "Your company name is required";
      if (touched.yourCompanyName) {
        touchedErrors.yourCompanyName = errors.yourCompanyName;
      }
    }
    if (!yourCompanyDescription?.blocks?.length) {
      errors.yourCompanyDescription = "Company description is required";
      if (touched.yourCompanyDescription) {
        touchedErrors.yourCompanyDescription = errors.yourCompanyDescription;
      }
    }
    if (!yourCompanyIndustry?.blocks?.length) {
      errors.yourCompanyIndustry = "Industry is required";
      if (touched.yourCompanyIndustry) {
        touchedErrors.yourCompanyIndustry = errors.yourCompanyIndustry;
      }
    }
    if (!targetCompanyName?.blocks?.length) {
      errors.targetCompanyName = "Target company name is required";
      if (touched.targetCompanyName) {
        touchedErrors.targetCompanyName = errors.targetCompanyName;
      }
    }
    if (selectedCategories.length === 0) {
      errors.researchFocus = "Select at least one research category";
      if (touched.researchFocus) {
        touchedErrors.researchFocus = errors.researchFocus;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      touchedErrors,
    };
  }, [yourCompanyName, yourCompanyDescription, yourCompanyIndustry, targetCompanyName, selectedCategories, touched]);

  const getData = useCallback(() => {
    // Filter researchPoints to only include true values (SDK format)
    const filteredResearchPoints = Object.fromEntries(
      Object.entries(selectedResearchPoints).filter(([_, value]) => value === true)
    );

    // Filter outputTitle to only include true values (SDK format)
    const filteredOutputTitle = Object.fromEntries(
      Object.entries(outputTitle).filter(([_, value]) => value === true)
    );

    return {
      name,
      templateId: selectedTemplateId,
      isFromScratch,
      selectedCategories,
      selectedResearchPoints,
      additionalContext,
      output: outputSchema,
      companyName: yourCompanyName,
      description: yourCompanyDescription,
      industry: yourCompanyIndustry,
      researchCompanyName: targetCompanyName,
      researchCompanyWebsite: targetCompanyWebsite,
      researchPoints: filteredResearchPoints,
      outputTitle: filteredOutputTitle,
      customOutputTitle: customOutputTitle?.blocks?.length > 0 ? customOutputTitle : undefined,
      customResearchPoints: customResearchPoints?.blocks?.length > 0 ? customResearchPoints : undefined,
      languageModel: "gpt-4o-mini",
      yourCompany: {
        name: yourCompanyName,
        description: yourCompanyDescription,
        industry: yourCompanyIndustry,
      },
      targetCompany: {
        name: targetCompanyName,
        website: targetCompanyWebsite,
      },
    };
  }, [
    name,
    selectedTemplateId,
    isFromScratch,
    yourCompanyName,
    yourCompanyDescription,
    yourCompanyIndustry,
    targetCompanyName,
    targetCompanyWebsite,
    selectedCategories,
    selectedResearchPoints,
    additionalContext,
    outputSchema,
    outputTitle,
    customOutputTitle,
    customResearchPoints,
  ]);

  const getError = useCallback(() => {
    const errorMessages = {
      0: [],
      1: [],
      2: [],
    };

    if (validation.errors.yourCompanyName) errorMessages[1].push(validation.errors.yourCompanyName);
    if (validation.errors.yourCompanyDescription) errorMessages[1].push(validation.errors.yourCompanyDescription);
    if (validation.errors.yourCompanyIndustry) errorMessages[1].push(validation.errors.yourCompanyIndustry);
    if (validation.errors.targetCompanyName) errorMessages[1].push(validation.errors.targetCompanyName);
    if (validation.errors.researchFocus) errorMessages[1].push(validation.errors.researchFocus);

    return errorMessages;
  }, [validation]);

  return {
    name,
    setName,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    yourCompanyName,
    yourCompanyDescription,
    yourCompanyIndustry,
    targetCompanyName,
    targetCompanyWebsite,
    selectedCategories,
    selectedResearchPoints,
    additionalContext,
    setAdditionalContext,
    outputTitle,
    customOutputTitle,
    customResearchPoints,
    outputSchema,
    validation,
    touched,
    selectTemplate,
    startFromScratch,
    applySelectedTemplate,
    updateYourCompanyName,
    updateYourCompanyDescription,
    updateYourCompanyIndustry,
    updateTargetCompanyName,
    updateTargetCompanyWebsite,
    toggleCategory,
    toggleResearchPoint,
    toggleOutputTitle,
    updateCustomOutputTitle,
    updateCustomResearchPoints,
    updateOutputSchema,
    markFieldTouched,
    markAllTouched,
    getData,
    getError,
  };
};
