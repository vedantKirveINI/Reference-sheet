import "./index.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  BLUR_COMMAND,
} from "lexical";
import {
  JSX,
  useRef,
  useState,
  KeyboardEvent,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { getDOMSelection } from "../../utils/getDOMSelection";
import { getScrollContainer } from "../../utils/setFloatingElemPosition";
import { setFloatingElemPositionForLinkEditor } from "../../utils/setFloatingElemPositionForLinkEditor";
import { sanitizeUrl, validateUrl } from "../../utils/url";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FLOATING_TOOLBAR_LINK_EDIT_CLASSNAME = "floating-toolbar-link-edit";
const FLOATING_TOOLBAR_LINK_TRASH_CLASSNAME = "floating-toolbar-link-trash";

interface FloatingLinkToolbarPluginBaseProps {
  anchorElem?: HTMLElement;
  isLinkInEditMode: boolean;
  onLinkEditModeChange: (isEditMode: boolean) => void;
}

function FloatingLinkEditor({
  editor,
  isLink,
  isLinkInEditMode,
  onLinkEditModeChange,
  anchorElem,
  setIsLink,
}: {
  isLink: boolean;
  setIsLink: Dispatch<SetStateAction<boolean>>;
  editor: LexicalEditor;
} & FloatingLinkToolbarPluginBaseProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
  const [linkUrl, setLinkUrl] = useState("");
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
    null
  );
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, (node) => $isLinkNode(node));

      let currentLinkUrl = "";
      if (linkParent) {
        currentLinkUrl = linkParent.getURL();
        setLinkUrl(currentLinkUrl);
      } else if ($isLinkNode(node)) {
        currentLinkUrl = node.getURL();
        setLinkUrl(currentLinkUrl);
      } else {
        setLinkUrl("");
      }
      // Don't overwrite editedLinkUrl during edit mode - let the user type
      // Only sync when we have a URL and not currently editing
    }

    const editorElem = editorRef.current;
    const nativeSelection = getDOMSelection(editor._window);
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect: DOMRect | undefined =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect();

      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      // Only reset if we're not in the middle of creating a new link
      // When isLinkInEditMode is true, keep the edit mode open
      if (!isLinkInEditMode) {
        if (rootElement !== null) {
          setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
        }
        setLastSelection(null);
        setLinkUrl("");
      }
    }

    return true;
  }, [anchorElem, editor, isLinkInEditMode, onLinkEditModeChange]);

  useEffect(() => {
    const scrollerElem = getScrollContainer(anchorElem) ?? anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener("resize", update);

    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);

      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        (event) => {
          const clickedButton = event?.relatedTarget as HTMLElement;
          const isToolbarButtonClicked =
            clickedButton &&
            (clickedButton.classList.contains(FLOATING_TOOLBAR_LINK_EDIT_CLASSNAME) ||
              clickedButton.classList.contains(FLOATING_TOOLBAR_LINK_TRASH_CLASSNAME));

          if (isLink && !isToolbarButtonClicked) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    if (isLinkInEditMode && inputRef.current) {
      inputRef.current.select();
    }
  }, [isLinkInEditMode, isLink]);

  // Initialize editedLinkUrl when entering edit mode
  // Use a ref to track if we just entered edit mode to set initial value correctly
  const prevEditModeRef = useRef(isLinkInEditMode);
  useEffect(() => {
    // Only set editedLinkUrl when transitioning INTO edit mode (false -> true)
    if (isLinkInEditMode && !prevEditModeRef.current) {
      // Read the current link URL from the editor state to get the correct value
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = getSelectedNode(selection);
          const linkParent = $findMatchingParent(node, (node) => $isLinkNode(node));
          let url = "";
          if (linkParent) {
            url = linkParent.getURL();
          } else if ($isLinkNode(node)) {
            url = node.getURL();
          }
          // Use the URL from the link node, or default to "https://" for new links
          setEditedLinkUrl(url || "https://");
        } else {
          setEditedLinkUrl("https://");
        }
      });
    }
    prevEditModeRef.current = isLinkInEditMode;
  }, [isLinkInEditMode, editor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  const handleLinkSubmission = useCallback(() => {
    if (!validateUrl(editedLinkUrl)) {
      setIsLinkInvalid(true);
      return;
    }

    if (lastSelection !== null) {
      if (linkUrl !== "") {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent();
            if ($isAutoLinkNode(parent)) {
              const linkNode = $createLinkNode(parent.getURL(), {
                rel: parent.__rel,
                target: parent.__target,
                title: parent.__title,
              });
              parent.replace(linkNode, true);
            }
          }
        });
      }
      setEditedLinkUrl("https://");
      onLinkEditModeChange(false);
    }
  }, [editedLinkUrl, editor, lastSelection, linkUrl, onLinkEditModeChange]);

  const onclose = useCallback(() => {
    if (!validateUrl(linkUrl)) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
    onLinkEditModeChange(false);
    setIsLinkInvalid(false);
  }, [editor, linkUrl, onLinkEditModeChange]);

  useOnClickOutside(editorRef, onclose, isLinkInEditMode);

  const monitorInputInteraction = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleLinkSubmission();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onclose();
      }
    },
    [handleLinkSubmission, onclose]
  );

  return (
    <div
      ref={editorRef}
      className="lexical-link-editor"
      data-testid="floating-toolbar-link-editor"
    >
      {/* Show edit mode when isLinkInEditMode is true (for new links) OR when isLink && isLinkInEditMode */}
      {/* Show link view only when isLink is true AND not in edit mode */}
      {isLinkInEditMode ? (
        <div className={cn(
          "flex items-center gap-2 p-2 rounded-md bg-white border border-border shadow-md",
          isLinkInvalid && "border-destructive"
        )}>
          <Input
            ref={inputRef}
            className={cn(
              "flex-1 h-7 text-sm min-w-[180px]",
              isLinkInvalid && "border-destructive focus-visible:ring-destructive"
            )}
            value={editedLinkUrl}
            onChange={(event) => {
              setEditedLinkUrl(event.target.value);
              setIsLinkInvalid(false);
            }}
            onKeyDown={(event) => {
              monitorInputInteraction(event);
            }}
            data-testid="floating-toolbar-link-input"
            placeholder="https://example.com"
          />
          {isLinkInvalid && (
            <span className="text-destructive text-xs whitespace-nowrap">Invalid</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleLinkSubmission}
            data-testid="floating-toolbar-link-confirm"
            title="Apply"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onclose}
            data-testid="floating-toolbar-link-cancel"
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : isLink ? (
        <div className="lexical-link-view flex items-center gap-2 p-2 rounded-md bg-white border border-border shadow-md" data-testid="floating-toolbar-link-view">
          <a
            href={sanitizeUrl(linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm text-blue-600 truncate hover:underline max-w-[180px]"
            data-testid="floating-toolbar-link"
          >
            {linkUrl}
          </a>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 text-muted-foreground hover:text-foreground", FLOATING_TOOLBAR_LINK_EDIT_CLASSNAME)}
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setEditedLinkUrl(linkUrl);
              onLinkEditModeChange(true);
            }}
            data-testid="floating-toolbar-link-edit"
            title="Edit link"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 text-muted-foreground hover:text-destructive", FLOATING_TOOLBAR_LINK_TRASH_CLASSNAME)}
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            }}
            data-testid="floating-toolbar-link-trash"
            title="Remove link"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function useFloatingLinkEditorToolbar({
  anchorElem,
  editor,
  isLinkInEditMode,
  onLinkEditModeChange,
}: {
  editor: LexicalEditor;
} & FloatingLinkToolbarPluginBaseProps) {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode
        );
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false);
          return;
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode);
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode &&
                (!autoLinkNode.is(focusAutoLinkNode) ||
                  autoLinkNode.getIsUnlinked()))
            );
          });
        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkInEditMode={isLinkInEditMode}
      onLinkEditModeChange={onLinkEditModeChange}
    />,
    anchorElem
  );
}

export default function FloatingLinkToolbarPlugin({
  isLinkInEditMode,
  onLinkEditModeChange,
  anchorElem,
}: FloatingLinkToolbarPluginBaseProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  return useFloatingLinkEditorToolbar({
    editor,
    isLinkInEditMode,
    onLinkEditModeChange,
    anchorElem,
  });
}
