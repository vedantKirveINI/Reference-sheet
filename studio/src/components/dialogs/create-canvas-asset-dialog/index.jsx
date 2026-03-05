import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ODSIcon } from "@src/module/ods";
import { MODE_CONFIG } from "@/components/studio/Header/config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getTemplatesForMode } from "@src/pages/ic-canvas/constants/createCanvasAssetTemplates";
import { MODE } from "@src/constants/mode";
import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";

const NAME_MAX_LENGTH = 75;
const DESCRIPTION_MAX_LENGTH = 120;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const CreateCanvasAssetDialog = ({
  onSave = () => {},
  onClose,
  defaultName = "",
  defaultDescription = "",
  mode,
  theme = {},
  assetTypeLabel = "",
}) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [selectedTemplateId, setSelectedTemplateId] = useState("scratch");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const nameInputRef = useRef(null);
  const descriptionRef = useRef(null);

  const isToolCanvas = mode === MODE.TOOL_CANVAS;
  const config = MODE_CONFIG[mode] || MODE_CONFIG[MODE.WC_CANVAS];
  const iconName = config?.icon;
  const templates = getTemplatesForMode(mode);

  const accentVar = theme.light || "#2C6FDA";
  const accentForeground = theme.foreground || "#fff";

  const validate = useCallback(() => {
    const nameValid = !!String(name).trim();
    const allowed = /^[a-zA-Z0-9 _\-.,&+():!]*$/.test(name.trim());
    const descriptionValid = !isToolCanvas || !!String(description).trim();

    let nextNameError = "";
    if (!nameValid) nextNameError = "Please enter a name";
    else if (!allowed && name.trim()) nextNameError = "Allowed: letters, numbers, spaces, and - _ . , & + () : !";

    let nextDescError = "";
    if (!descriptionValid && isToolCanvas) nextDescError = "Please enter a description for the AI tool";

    setNameError(nextNameError);
    setDescriptionError(nextDescError);
    return {
      valid: nextNameError === "" && nextDescError === "",
      nameInvalid: nextNameError !== "",
      descriptionInvalid: nextDescError !== "",
    };
  }, [name, description, isToolCanvas]);

  const handleSave = useCallback(() => {
    setHasAttemptedSubmit(true);
    const result = validate();
    if (!result.valid) {
      if (result.nameInvalid) nameInputRef.current?.focus();
      else if (result.descriptionInvalid) descriptionRef.current?.focus();
      return;
    }
    onSave({ name: name.trim(), description: description.trim() });
  }, [validate, name, description, onSave]);

  const handleNameChange = (e) => {
    const value = e.target.value.slice(0, NAME_MAX_LENGTH);
    const isValid = /^[a-zA-Z0-9 _\-.,&+():!]*$/.test(value);
    setName(value);
    if (hasAttemptedSubmit) {
      setNameError(
        !value.trim()
          ? "Please enter a name"
          : !isValid
            ? "Allowed: letters, numbers, spaces, and - _ . , & + () : !"
            : ""
      );
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value.slice(0, DESCRIPTION_MAX_LENGTH);
    setDescription(value);
    if (hasAttemptedSubmit && isToolCanvas && descriptionError) {
      setDescriptionError(value.trim() ? "" : "Please enter a description for the AI tool");
    }
  };

  const handleTemplateSelect = useCallback(
    (template) => {
      if (template.disabled) return;
      setSelectedTemplateId(template.id);
      if (template.id === "scratch") {
        setName(defaultName);
        setDescription(defaultDescription);
      } else if (template.suggestedName != null || template.suggestedDescription != null) {
        if (template.suggestedName != null) setName(template.suggestedName.slice(0, NAME_MAX_LENGTH));
        if (template.suggestedDescription != null) setDescription(template.suggestedDescription.slice(0, DESCRIPTION_MAX_LENGTH));
      }
    },
    [defaultName, defaultDescription]
  );

  const inputBaseClasses = cn(
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
    "transition-colors duration-150 border border-input"
  );
  const inputFocusStyle = accentVar ? { ["--tw-ring-color"]: accentVar } : undefined;
  const inputErrorClasses = nameError && "border-destructive focus-visible:ring-destructive";
  const textareaErrorClasses = descriptionError && "border-destructive focus-visible:ring-destructive";

  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={
        accentVar
          ? {
              ["--create-dialog-accent"]: accentVar,
              ["--create-dialog-accent-foreground"]: accentForeground,
            }
          : undefined
      }
    >
      {/* Header — edge-to-edge (dialog has p-0, we add px-6 pt-6) */}
      <motion.header
        className="relative overflow-hidden rounded-t-lg px-6 pt-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={accentVar ? { background: `linear-gradient(135deg, ${accentVar} 0%, transparent 60%)` } : undefined}
        />
        <div className="relative flex items-start gap-4 pb-4">
          <motion.div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={
              accentVar
                ? {
                    backgroundColor: `${accentVar}20`,
                    boxShadow: `0 2px 8px ${accentVar}25`,
                  }
                : undefined
            }
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {iconName && (
              <ODSIcon
                outeIconName={iconName}
                outeIconProps={{
                  sx: { width: "1.25rem", height: "1.25rem", color: accentVar },
                }}
              />
            )}
          </motion.div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Create a new {assetTypeLabel}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Start from a template or create a blank {assetTypeLabel.toLowerCase()}. You can change this later.
            </p>
          </div>
        </div>
      </motion.header>

      {/* Form + templates — ring-inset avoids focus clipping by overflow */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
        <motion.div
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Details */}
          <motion.section className="space-y-3" variants={item}>
            <div className="space-y-1.5">
              <Label htmlFor="create-asset-name" className="text-sm font-medium text-foreground">
                Name
              </Label>
              <Input
                id="create-asset-name"
                ref={nameInputRef}
                value={name}
                onChange={handleNameChange}
                placeholder={`e.g. My ${assetTypeLabel}`}
                className={cn(
                  "h-10 rounded-md px-3 text-sm",
                  inputBaseClasses,
                  inputErrorClasses,
                  !nameError && "focus-visible:ring-[var(--create-dialog-accent)]"
                )}
                style={!nameError ? inputFocusStyle : undefined}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "name-error" : undefined}
              />
              <AnimatePresence mode="wait">
                {nameError && (
                  <motion.p
                    id="name-error"
                    className="flex items-center gap-1.5 text-xs text-destructive"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {icons.alertTriangle && <icons.alertTriangle className="size-3.5 shrink-0" />}
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs text-muted-foreground">{name.length}/{NAME_MAX_LENGTH}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-asset-desc" className="text-sm font-medium text-foreground">
                Description {!isToolCanvas && <span className="font-normal text-muted-foreground">(optional)</span>}
              </Label>
              <Textarea
                id="create-asset-desc"
                ref={descriptionRef}
                value={description}
                onChange={handleDescriptionChange}
                placeholder={`What is this ${assetTypeLabel.toLowerCase()} for?`}
                rows={2}
                className={cn(
                  "min-h-[64px] resize-none rounded-md px-3 py-2 text-sm",
                  inputBaseClasses,
                  textareaErrorClasses,
                  !descriptionError && "focus-visible:ring-[var(--create-dialog-accent)]"
                )}
                style={!descriptionError ? inputFocusStyle : undefined}
                aria-invalid={!!descriptionError}
                aria-describedby={descriptionError ? "description-error" : undefined}
              />
              <AnimatePresence mode="wait">
                {descriptionError && (
                  <motion.p
                    id="description-error"
                    className="flex items-center gap-1.5 text-xs text-destructive"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {icons.alertTriangle && <icons.alertTriangle className="size-3.5 shrink-0" />}
                    {descriptionError}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs text-muted-foreground">{description.length}/{DESCRIPTION_MAX_LENGTH}</p>
            </div>
          </motion.section>

          {/* Templates — compact cards */}
          <motion.section className="space-y-2" variants={item}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Templates
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose a starting point or start from scratch.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {templates.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                const isDisabled = !!template.disabled;

                return (
                  <motion.button
                    key={template.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleTemplateSelect(template)}
                    className={cn(
                      "group relative flex flex-col items-start gap-2 rounded-lg border p-2.5 text-left transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      isDisabled && "cursor-not-allowed border-muted bg-muted/30 opacity-70",
                      !isDisabled && [
                        "border-border bg-card hover:border-[var(--create-dialog-accent)]/50 hover:bg-muted/30",
                        isSelected &&
                          "border-[var(--create-dialog-accent)] bg-[var(--create-dialog-accent)]/10 ring-2 ring-inset ring-[var(--create-dialog-accent)]/20",
                      ]
                    )}
                    style={
                      isSelected && !isDisabled && accentVar
                        ? {
                            borderColor: accentVar,
                            backgroundColor: `${accentVar}14`,
                          }
                        : undefined
                    }
                    variants={item}
                    whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {isSelected && !isDisabled && (
                      <motion.span
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                        style={accentVar ? { backgroundColor: accentVar, color: accentForeground } : undefined}
                        aria-hidden
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        {icons.check && <icons.check className="size-3 text-current" />}
                      </motion.span>
                    )}
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={
                        accentVar && !isDisabled
                          ? { backgroundColor: `${accentVar}22` }
                          : undefined
                      }
                    >
                      {iconName && !isDisabled ? (
                        <ODSIcon
                          outeIconName={iconName}
                          outeIconProps={{
                            sx: { width: "0.875rem", height: "0.875rem", color: accentVar },
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground/60">
                          {icons.layoutGrid && <icons.layoutGrid className="size-4" />}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pr-5">
                      <span className={cn("text-xs font-semibold", isDisabled && "text-muted-foreground")}>
                        {template.title}
                      </span>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Footer — edge-to-edge */}
      <motion.footer
        className="shrink-0 border-t border-border bg-muted/30 px-6 py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.25 }}
      >
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[88px] rounded-lg border-2 px-4 py-2 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="min-w-[120px] rounded-lg px-5 py-2 font-semibold shadow-md transition-all hover:shadow-lg"
            style={
              accentVar
                ? { backgroundColor: accentVar, color: accentForeground }
                : undefined
            }
          >
            Create
          </Button>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default CreateCanvasAssetDialog;
