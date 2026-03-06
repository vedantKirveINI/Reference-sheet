import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Drawer from "@src/module/drawer";
import ExtensionHeader from "./ExtensionHeader";
import "./extension-shell.css";

const ExtensionShell = forwardRef(
  (
    {
      children,
      node = {},
      title = {},
      showSidebar = true,
      sidebarActions = [],
      loading = false,
      showTitleEditButton = true,
      onClose = () => {},
      onSave = () => {},
      onTitleChanged = () => {},
      onSidebarActionClick = () => {},
      onSidebarToggle = () => {},
      beforeClose,
      drawerWidth = "52.5rem",
      allowContentOverflow = false,
      actions,
      commonShellRef,
    },
    ref
  ) => {
    const drawerRef = useRef();
    const [currentTitle, setCurrentTitle] = useState(title);

    const handleTitleSave = useCallback(
      (newTitleData) => {
        const updatedTitle = { ...currentTitle, ...newTitleData };
        setCurrentTitle(updatedTitle);
        onTitleChanged(newTitleData);
        drawerRef.current?.closeSidebarPanel();
      },
      [currentTitle, onTitleChanged]
    );

    const handleTitleEditClick = useCallback(() => {
      drawerRef.current?.openSidebarPanel({
        id: "edit-title",
        name: (
          <ExtensionHeader
            title={currentTitle}
            node={node}
            showEditButton={false}
          />
        ),
        panel: (
          <TitleEditPanel
            title={currentTitle}
            onSave={handleTitleSave}
            onDiscard={() => drawerRef.current?.closeSidebarPanel()}
          />
        ),
      });
    }, [currentTitle, node, handleTitleSave]);

    const handleSidebarActionClick = useCallback(
      (...args) => {
        onSave(true);
        onSidebarActionClick(...args);
      },
      [onSave, onSidebarActionClick]
    );

    useImperativeHandle(
      ref,
      () => ({
        updateTitle: (newTitle) => {
          setCurrentTitle(newTitle);
          drawerRef.current?.updateTitle(
            <ExtensionHeader
              title={newTitle}
              node={node}
              showEditButton={showTitleEditButton}
              onEditClick={handleTitleEditClick}
            />
          );
        },
        openSidebarPanel: (panel) => drawerRef.current?.openSidebarPanel(panel),
        closeSidebarPanel: (event, reason) => drawerRef.current?.closeSidebarPanel(event, reason),
        clickAction: (id) => drawerRef.current?.clickAction(id),
        isActionOpen: () => drawerRef.current?.isActionOpen(),
        getDrawerRef: () => drawerRef.current,
      }),
      [node, showTitleEditButton, handleTitleEditClick]
    );

    useImperativeHandle(
      commonShellRef,
      () => ({
        updateTitle: (titleObject) => {
          const newTitle = { ...currentTitle, ...titleObject };
          setCurrentTitle(newTitle);
          drawerRef.current?.updateTitle(
            <ExtensionHeader
              title={newTitle}
              node={node}
              showEditButton={showTitleEditButton}
              onEditClick={handleTitleEditClick}
            />
          );
        },
      }),
      [currentTitle, node, showTitleEditButton, handleTitleEditClick]
    );

    return (
      <Drawer
        ref={drawerRef}
        open={true}
        loading={loading}
        onClose={onClose}
        dividers={false}
        drawerWidth={drawerWidth}
        allowContentOverflow={allowContentOverflow}
        removeContentPadding={true}
        showFullscreenIcon={false}
        showSidebar={showSidebar}
        beforeClose={beforeClose}
        title={
          <ExtensionHeader
            title={currentTitle}
            node={node}
            showEditButton={showTitleEditButton}
            onEditClick={handleTitleEditClick}
          />
        }
        headerColor={currentTitle.background || node.background || "#1C3693"}
        headerTextColor={currentTitle.foreground || node.foreground || "#FFFFFF"}
        sidebarProps={{
          style: {
            color: currentTitle.foreground || node.foreground,
            background: currentTitle.background || node.background,
          },
          activeStyles: {
            background: "#fff",
            color: node.dark || "#000",
          },
          actions: sidebarActions,
        }}
        onSidebarActionClick={handleSidebarActionClick}
        onSidebarToggle={onSidebarToggle}
        actions={actions}
      >
        <div className="extension-shell-content">
          {children}
        </div>
      </Drawer>
    );
  }
);

const TitleEditPanel = ({ title, onSave, onDiscard }) => {
  const [name, setName] = useState(title.name || "");
  const [description, setDescription] = useState(title.hoverDescription || "");
  const [errors, setErrors] = useState({ name: "", description: "" });

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      return;
    }
    if (trimmedName.length > 40) {
      setErrors((prev) => ({ ...prev, name: "Maximum 40 characters" }));
      return;
    }
    onSave({ name: trimmedName, hoverDescription: description });
  };

  return (
    <div className="extension-title-edit-panel">
      <div className="extension-title-edit-fields">
        <div className="extension-title-edit-field">
          <label className="extension-title-edit-label">
            Node Name<span className="extension-title-required">*</span>
          </label>
          <div className="extension-title-input-wrapper">
            <input
              type="text"
              className={`extension-title-input ${errors.name ? "extension-title-input-error" : ""}`}
              placeholder="Type your node name here"
              value={name}
              onChange={(e) => {
                setErrors((prev) => ({ ...prev, name: "" }));
                if (e.target.value.length <= 40) {
                  setName(e.target.value);
                }
              }}
              onFocus={(e) => e.target.select()}
              data-testid="node-title-editor-input"
            />
            <span className="extension-title-char-count">{name.length}/40</span>
          </div>
          {errors.name && (
            <span className="extension-title-error">{errors.name}</span>
          )}
        </div>

        <div className="extension-title-edit-field">
          <label className="extension-title-edit-label">Node Description</label>
          <div className="extension-title-input-wrapper">
            <input
              type="text"
              className="extension-title-input"
              placeholder="Type your description here"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 80) {
                  setDescription(e.target.value);
                }
              }}
              onFocus={(e) => e.target.select()}
              data-testid="node-description-editor-input"
            />
            <span className="extension-title-char-count">
              {description.length}/80
            </span>
          </div>
        </div>
      </div>

      <div className="extension-title-edit-actions">
        <button
          type="button"
          className="extension-title-btn extension-title-btn-secondary"
          onClick={onDiscard}
          data-testid="node-meta-discard-button"
        >
          DISCARD
        </button>
        <button
          type="button"
          className="extension-title-btn extension-title-btn-primary"
          onClick={handleSave}
          data-testid="node-meta-save-button"
        >
          SAVE
        </button>
      </div>
    </div>
  );
};

export default ExtensionShell;
