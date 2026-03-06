// not use but useful to get the text content of editor
import { LexicalEditor, $getRoot } from "lexical";
export const getLexicalEditorTextContent = (editor: LexicalEditor): string => {
  return editor.getEditorState().read(() => $getRoot().getTextContent()) || "";
};
