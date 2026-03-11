import { ReactNode, useEffect } from "react";

import {
  LexicalCommand,
  createCommand,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createRecallNode, RecallNode } from "../../nodes/recall.node";

import { RecallPayload } from "../../utils/create-recall-payload";
import { generateUUID } from "@/lib/utils";

export const INSERT_RECALL_COMMAND: LexicalCommand<RecallPayload> =
  createCommand("INSERT_RECALL_COMMAND");

export type RecallPluginProps = {
  variables: any;
  isCreator?: boolean;
  canvasTheme?: Record<string, string>;
};

export default function RecallPlugin({
  variables,
  isCreator = false,
  canvasTheme = {},
}: RecallPluginProps): ReactNode | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([RecallNode])) {
      throw new Error("RecallNode: RecallNode not registered on editor");
    }
    return editor.registerCommand<RecallPayload>(
      INSERT_RECALL_COMMAND,
      (payload: RecallPayload) => {
        const recallNodeId = generateUUID();
        const recallTheme = {
          ...(payload.theme || {}),
          fontFamily: canvasTheme?.fontFamily,
        };
        const node = $createRecallNode(
          payload.question,
          payload.nodeData?.go_data?.answer,
          payload?.nodeData?.key,
          payload.path,
          payload.originalPath,
          recallNodeId,
          recallTheme
        );
        $insertNodes([node]);
        return true;
      },

      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, isCreator, variables]);
  return null;
}
