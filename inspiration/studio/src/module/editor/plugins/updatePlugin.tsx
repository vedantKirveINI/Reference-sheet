import React, { forwardRef, useCallback, useImperativeHandle } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

export interface UpdatePluginProps {}

export interface UpdatePluginRef {
  insertTextAsParagraph: (text: string, clearAllBeforeInsert?: boolean) => void;
}

export const UpdatePlugin = forwardRef<UpdatePluginRef, UpdatePluginProps>(
  ({}, ref) => {
    const [editor] = useLexicalComposerContext();

    const insertTextAsParagraphHandler = useCallback(
      (text: string, clearAllBeforeInsert: boolean = false) => {
        if (!text || typeof text !== "string") return;
        editor.update(() => {
          // Get the RootNode from the EditorState
          const root = $getRoot();

          if (clearAllBeforeInsert) {
            root.clear();
          }

          const paragraphNode = $createParagraphNode();
          const textNode = $createTextNode(text);
          paragraphNode.append(textNode);

          root.append(paragraphNode);

          // TODO : This is temperorary solution will fix the cursor postion to go at end of the paragraph
          setTimeout(() => {
            editor.blur();
            editor.focus();
          }, 0);
        });
      },
      [editor]
    );

    useImperativeHandle(ref, () => {
      return {
        insertTextAsParagraph: insertTextAsParagraphHandler,
      };
    }, [insertTextAsParagraphHandler]);

    return null;
  }
);
