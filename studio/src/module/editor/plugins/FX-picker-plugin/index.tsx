import * as React from "react";
import "./index.css";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  RangeSelection,
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  type TextNode,
} from "lexical";
import { useBasicTypeaheadTriggerMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";

import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import Variables from "../../components/variables/variables";
import { INSERT_RECALL_COMMAND } from "../RecallPlugin";
import { RecallPayload } from "../../utils/create-recall-payload";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

export type MenuTextMatch = {
  leadOffset: number;
  matchingString: string;
  replaceableString: string;
};

interface FXPickerPluginProps {
  variables?: any;
}

/**
 * Walk backwards along user input and forward through entity title to try
 * and replace more of the user's text with entity.
 */
function getFullMatchOffset(
  documentText: string,
  entryText: string,
  offset: number
): number {
  let triggerOffset = offset;
  for (let i = triggerOffset; i <= entryText.length; i++) {
    if (documentText.substr(-i) === entryText.substr(0, i)) {
      triggerOffset = i;
    }
  }
  return triggerOffset;
}

/**
 * Split Lexical TextNode and return a new TextNode only containing matched text.
 * Common use cases include: removing the node, replacing with a new node.
 */
function $splitNodeContainingQuery(match: MenuTextMatch): TextNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }
  const anchor = selection.anchor;
  if (anchor.type !== "text") {
    return null;
  }
  const anchorNode = anchor.getNode();
  if (!anchorNode.isSimpleText()) {
    return null;
  }
  const selectionOffset = anchor.offset;
  const textContent = anchorNode.getTextContent().slice(0, selectionOffset);
  const characterOffset = match.replaceableString.length;
  const queryOffset = getFullMatchOffset(
    textContent,
    match.matchingString,
    characterOffset
  );
  const startOffset = selectionOffset - queryOffset;
  if (startOffset < 0) {
    return null;
  }
  let newNode;
  if (startOffset === 0) {
    [newNode] = anchorNode.splitText(selectionOffset);
  } else {
    [, newNode] = anchorNode.splitText(startOffset, selectionOffset);
  }

  return newNode;
}

function getTextUpToAnchor(selection: RangeSelection): string | null {
  const anchor = selection.anchor;

  if (anchor.type !== "text") {
    return null;
  }
  const anchorNode = anchor.getNode();

  if (!anchorNode.isSimpleText()) {
    return null;
  }
  const anchorOffset = anchor.offset;
  return anchorNode.getTextContent().slice(0, anchorOffset);
}

function getQueryTextForSearch(editor: LexicalEditor): string | null {
  let text = null;

  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return null;
    }

    text = getTextUpToAnchor(selection);
  });

  return text;
}

export default function FXPickerPlugin({
  variables,
}: FXPickerPluginProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [matchContent, setMatchContent] = React.useState<MenuTextMatch | null>(
    null
  );
  const [anchorRect, setAnchorRect] = React.useState<{
    top: number;
    left: number;
    bottom: number;
  } | null>(null);
  const open = Boolean(anchorEl);

  const anchorRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!anchorEl) {
      setAnchorRect(null);
      return;
    }
    const rect = anchorEl.getBoundingClientRect();
    setAnchorRect({
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
    });
  }, [anchorEl]);

  const handleOpenChange = React.useCallback((openState: boolean) => {
    if (!openState) {
      setAnchorEl(null);
      setMatchContent(null);
    }
  }, []);

  const handleClickAway = React.useCallback(
    (_event: MouseEvent | TouchEvent) => {
      setAnchorEl(null);
      setMatchContent(null);
    },
    []
  );

  useOnClickOutside(contentRef, handleClickAway, open);

  const clearNodeAfterSelect = React.useCallback(() => {
    editor.update(() => {
      const textNodeContainingQuery =
        matchContent != null ? $splitNodeContainingQuery(matchContent) : null;

      textNodeContainingQuery.remove();
    });
  }, [editor, matchContent]);

  const OnDataBlockClick = React.useCallback(
    (payload: RecallPayload) => {
      clearNodeAfterSelect();
      editor.dispatchCommand(INSERT_RECALL_COMMAND, payload);
    },
    [clearNodeAfterSelect, editor]
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("@", {
    minLength: 0,
  });

  const updateListener = React.useCallback(() => {
    editor.getEditorState().read(() => {
      const text = getQueryTextForSearch(editor);
      const match = checkForTriggerMatch(text, editor);

      if (match !== null) {
        const selection = $getSelection() as RangeSelection;
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        const anchorOffset = anchor.offset;
        const triggerText = anchorNode
          .getTextContent()
          .slice(anchorOffset - 1, anchorOffset);

        if (triggerText === "@") {
          const el = editor.getElementByKey(anchorNode.getKey());
          setAnchorEl(el);
          if (el) {
            const rect = el.getBoundingClientRect();
            setAnchorRect({
              top: rect.top,
              left: rect.left,
              bottom: rect.bottom,
            });
          }
          setMatchContent(match);
        } else {
          setAnchorEl(null);
          setAnchorRect(null);
        }
      } else {
        setAnchorEl(null);
        setAnchorRect(null);
      }
    });
  }, [checkForTriggerMatch]);

  React.useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(updateListener);

    return () => {
      removeUpdateListener();
    };
  }, [editor, updateListener]);

  const shouldRenderPopover = open && anchorRect;

  return shouldRenderPopover ? (
    <>
      <div
        ref={anchorRef}
        style={{
          position: "fixed",
          top: anchorRect.bottom,
          left: anchorRect.left,
          width: 1,
          height: 1,
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverAnchor virtualRef={{ current: anchorRef.current }} />
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={8}
          collisionBoundary={document.body}
          collisionPadding={8}
          className="p-0 rounded-md border bg-popover shadow-md w-72 min-h-[12rem] max-h-[min(24rem,70vh)] overflow-hidden z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          data-testid="fx-picker-plugin"
        >
          <div ref={contentRef} className="outline-none">
            <Variables
              nodeVariables={variables?.NODE}
              localVariables={variables?.LOCAL}
              globalVariables={variables?.GLOBAL}
              onDataBlockClick={OnDataBlockClick}
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  ) : null;
}
