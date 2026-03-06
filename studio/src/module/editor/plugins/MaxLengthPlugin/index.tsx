import { useEffect, JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  RootNode,
  EditorState,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { trimTextContentFromAnchor } from "@lexical/selection";
import { $restoreEditorState } from "@lexical/utils";

type TMaxLengthPlugin = {
  maxLength: number | null;
};

export function MaxLengthPlugin({
  maxLength,
}: TMaxLengthPlugin): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!maxLength) return;

    // Set the editor to not editable - it won't take focus while in that state
    // https://github.com/facebook/lexical/issues/4474
    editor.setEditable(false);

    let lastRestoredEditorState: EditorState | null = null;
    const unregister = editor.registerNodeTransform(
      RootNode,
      (rootNode: RootNode) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

        const prevEditorState = editor.getEditorState();

        const prevTextContentSize = prevEditorState.read(() =>
          rootNode.getTextContentSize()
        );

        const textContentSize = rootNode.getTextContentSize();

        if (prevTextContentSize !== textContentSize) {
          const delCount = textContentSize - maxLength;
          const anchor = selection.anchor;

          if (delCount > 0) {
            if (
              prevTextContentSize === maxLength &&
              lastRestoredEditorState !== prevEditorState
            ) {
              lastRestoredEditorState = prevEditorState;
              $restoreEditorState(editor, prevEditorState);
            } else {
              trimTextContentFromAnchor(editor, anchor, delCount);
            }
          }
        }
      }
    );

    // Set the editor back to editable a frame later
    requestAnimationFrame(() => editor.setEditable(true));

    return unregister;
  }, [editor, maxLength]);
  return null;
}
