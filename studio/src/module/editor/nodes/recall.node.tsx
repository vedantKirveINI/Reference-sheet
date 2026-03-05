import React, { ReactNode, Suspense } from "react";
import "./recall.node.css";
import CrossIcon from "../assets/icon/cross-icon";

import {
  DecoratorNode,
  LexicalNode,
  Spread,
  SerializedLexicalNode,
  DOMExportOutput,
  DOMConversionMap,
  $nodesOfType,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { removeTagsFromString } from "@oute/oute-ds.core.constants";

type Theme = Record<string, string>;

export type RecallComponentProps = {
  recall_node_id: string | number;
  question: string;
  theme?: Theme;
};

export type SerializedRecallNode = Spread<
  {
    recall_node_id: string | number;
    question: string;
    answer: string;
    nodeId: string | number;
    path: string | null;
    originalPath: string | null;
    theme?: Theme;
  },
  SerializedLexicalNode
>;

const RecallComponent = ({
  question,
  recall_node_id,
  theme,
}: RecallComponentProps): ReactNode => {
  const [editor] = useLexicalComposerContext();
  const handleDeleteRecallNode = React.useCallback(
    (recall_node_id: string | number) => {
      if (editor === null) return;

      editor.update(() => {
        const nodes = $nodesOfType(RecallNode);

        for (const node of nodes) {
          if ((node as RecallNode)._recall_node_id === recall_node_id) {
            node.remove();
          }
        }
      });
    },
    [editor]
  );

  return (
    <div
      className="lexical-recall-node-container"
      style={{
        backgroundColor: theme?.background || "#ffc8c8",
        fontFamily: theme?.fontFamily || "Noto Serif",
      }}
    >
      <span
        className="lexical-recall-node-text"
        style={{
          color: theme?.foreground || "#263238",
        }}
      >
        {removeTagsFromString(question)}
      </span>

      <CrossIcon
        data-testid="recall-delete-button"
        width={"1.25em"}
        height={"1.25em"}
        fillColor={theme?.foreground || "#263238"}
        style={{ cursor: "pointer" }}
        onClick={() => handleDeleteRecallNode(recall_node_id)}
      />
    </div>
  );
};

export class RecallNode extends DecoratorNode<ReactNode> {
  _recall_node_id: string | number;
  _id: string | number;
  _question: string;
  _answer: string;
  _path?: string | null;
  _originalPath?: string | null;
  _theme?: Theme;

  static clone(node: RecallNode): RecallNode {
    return new RecallNode(
      node._question,
      node._answer,
      node._id,
      node._path,
      node._originalPath,
      node._recall_node_id,
      node._theme,
      node?.__key
    );
  }

  static getType(): "recall" {
    return "recall";
  }

  static importJSON(serializedNode: SerializedRecallNode): RecallNode {
    const node = $createRecallNode(
      serializedNode.question,
      serializedNode.answer,
      String(serializedNode.nodeId),
      serializedNode.path,
      serializedNode.originalPath,
      serializedNode.recall_node_id,
      serializedNode.theme
    );

    return node;
  }

  exportJSON(): SerializedRecallNode {
    return {
      ...super.exportJSON(),
      question: this._question,
      answer: this._answer,
      nodeId: this._id,
      path: this._path,
      originalPath: this._originalPath,
      theme: this._theme,
      recall_node_id: this._recall_node_id,
      type: "recall",
      version: 1,
    };
  }

  constructor(
    question: string,
    answer: string,
    id: number | string,
    path: string | null,
    originalPath: string | null,
    recall_node_id: string | number,
    theme?: Theme,
    __key?: string
  ) {
    super(__key);
    this._question = question;
    this._answer = answer;
    this._id = id;
    this._path = path;
    this._originalPath = originalPath;
    this._recall_node_id = recall_node_id;
    this._theme = theme || {};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-recall-question")) {
          return null;
        }
        return {
          conversion: () => {
            const question = domNode.getAttribute(
              "data-lexical-recall-question"
            );

            const path = domNode.getAttribute("data-lexical-recall-path");
            const originalPath = domNode.getAttribute(
              "data-lexical-recall-original-path"
            );
            const answer = domNode.getAttribute("data-lexical-answer-options");
            const recall_node_id = domNode.getAttribute(
              "data-lexical-recall-node-id"
            );
            const _id = domNode.getAttribute("node-id");

            const theme =
              (JSON.parse(domNode.getAttribute("node-theme")) as Theme) || {};

            if (question !== null || answer !== null) {
              const node = $createRecallNode(
                question,
                answer,
                _id,
                path,
                originalPath,
                recall_node_id,
                theme
              );
              return { node };
            }
            return null;
          },
          priority: 2,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute(
      "data-lexical-recall-question",
      this._question.startsWith("<p>")
        ? this._question
        : `<p>${this._question}</p>`
    );
    element.setAttribute(
      "data-lexical-recall-node-id",
      `${this._recall_node_id}`
    );
    // element.setAttribute("data-lexical-recall-answer", this._answer);
    element.setAttribute("data-lexical-recall-path", this._path);
    if (this._originalPath) {
      element.setAttribute(
        "data-lexical-recall-original-path",
        this._originalPath
      );
    }
    element.setAttribute("node-id", `${this._id}`);
    element.setAttribute("node-theme", JSON.stringify(this._theme || {}));

    return {
      element: element,
    };
  }

  createDOM(): HTMLElement {
    const elem = document.createElement("span");
    elem.style.display = "inline-block";
    elem.className = "lexical-recall-node";
    return elem;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): ReactNode {
    return (
      <Suspense fallback={null}>
        <RecallComponent
          question={this._question}
          recall_node_id={this._recall_node_id}
          theme={this._theme}
        />
      </Suspense>
    );
  }
}

export function $createRecallNode(
  question: string,
  answer: string,
  id: string,
  path: string | null,
  originalPath: string | null,
  recall_node_id: string | number,
  theme?: Theme
): RecallNode {
  return new RecallNode(
    question,
    answer,
    id,
    path,
    originalPath,
    recall_node_id,
    theme
  );
}

export function $isRecallNode(
  node: LexicalNode | null | undefined
): node is RecallNode {
  return node instanceof RecallNode;
}
