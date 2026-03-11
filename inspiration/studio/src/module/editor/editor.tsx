import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { InitialConfigType, LexicalComposer,  } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import "./styles.css";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $insertNodes } from "lexical";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import FloatingLinkToolbarPlugin from "./plugins/FloatingLinkToolbarPlugin";
import { getPlaceholderColor } from "./styles";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import { EditorProps, EditorRef } from "./types";
import { getInputStyles } from "./styles";
import FXPickerPlugin from "./plugins/FX-picker-plugin";
import RecallPlugin from "./plugins/RecallPlugin";
import { RecallNode } from "./nodes/recall.node";
import { SingleLinePlugin } from "./plugins/SingleLinePlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import { UpdatePlugin, type UpdatePluginRef } from "./plugins/updatePlugin";
const EDITOR_NODES = [AutoLinkNode, LinkNode, RecallNode];

type LexicalEditorProps = {
  config: InitialConfigType;
  id?: any;
  onChange?: any;
  placeholder?: string;
  theme?: any;
  testId?: any;
  enableFXPicker?: boolean;
  variables?: any;
  editable?: boolean;
  enableSingleLineEditing?: boolean;
  enableLinkCreation?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  editorValue?: any;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  enableRecall?: boolean;
  /** Applied to the inner content wrapper so the editor can shrink to content (e.g. width: fit-content) */
  contentStyle?: React.CSSProperties;
};

export const LexicalEditor = forwardRef<EditorRef, LexicalEditorProps>(
  (props: LexicalEditorProps, ref) => {
    const {
      onChange,
      placeholder,
      theme,
      testId = "lexical-editor",
      enableFXPicker = false,
      variables = {},
      editable,
      enableSingleLineEditing = false,
      enableLinkCreation = false,
      maxLength,
      autoFocus = false,
      editorValue = "",
      onFocus = () => {},
      onBlur = () => {},
      enableRecall,
      contentStyle,
    } = props;

    const updatePluginRef = useRef<UpdatePluginRef | null>(null);
    const editorRef = useRef(null);
    const _onChange = (editorState, editor, c) => {
      editor.update(() => {
        const _raw = $generateHtmlFromNodes(editor, null);

        if (onChange) {
          const regex = /(<([^>]+)>)/gi;
          const textContent = _raw.replace(regex, "");
          const hasRecallNode = /data-lexical-recall-node-id/.test(_raw);
          const isEmpty = !textContent && !hasRecallNode;
          onChange(isEmpty ? "" : _raw);
        }
      });
    };

    const [floatingAnchorElem, setFloatingAnchorElem] =
      useState<HTMLDivElement | null>(null);
    const [isLinkInEditMode, setIsLinkInEditMode] = useState(false);

    const onLinkEditModeChange = useCallback((isEditMode: boolean) => {
      setIsLinkInEditMode(isEditMode);
    }, []);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
      if (_floatingAnchorElem !== null) {
        setFloatingAnchorElem(_floatingAnchorElem);
      }
    };

    const [height, setHeight] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    const editorStyles = {
      outline: "none",
      ...getInputStyles(theme)
    };

    useEffect(() => {
      if (editorRef.current && !autoFocus) {
        editorRef.current?.blur();
      }
    }, []);

    useImperativeHandle(ref, () => {
      return {
        focus: () => {
          editorRef.current?.focus();
        },
        blur: () => {
          editorRef.current?.blur();
        },
        insertTextAsParagraph: updatePluginRef.current?.insertTextAsParagraph,
      };
    }, []);

    return (
      <LexicalComposer initialConfig={props.config}>
        <RichTextPlugin
          contentEditable={
            <div
              className="editor"
              id="editor"
              style={{
                width: "100%",
                cursor: editable ? "text" : "inherit",
                ...contentStyle,
              }}
              ref={onRef}
            >
              <ContentEditable
                ref={editorRef}
                style={{
                  ...editorStyles,
                  minHeight: editorValue.length <= 0 ? height : "auto",
                }}
                className="content-editor"
                onFocus={(event) => {
                  setIsFocused(true);
                  onFocus?.(event);
                }}
                onBlur={(event) => {
                  setIsFocused(false);
                  onBlur?.(event);
                }}
                data-testid={testId}
              />
            </div>
          }
          placeholder={
            <Placeholder
              theme={theme}
              placeholder={placeholder}
              style={editorStyles}
              isFocused={isFocused}
              ref={(node) => {
                if (node) {
                  const rect = (node as HTMLDivElement).getBoundingClientRect();
                  setHeight(rect.height);
                }
              }}
              data-testid={`${testId}-placeholder`}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin ignoreSelectionChange onChange={_onChange} />
        <HistoryPlugin />
        {autoFocus && <AutoFocusPlugin />}
        {enableRecall && (
          <RecallPlugin
            variables={variables}
            isCreator={editable}
            canvasTheme={theme}
          />
        )}
        {enableFXPicker && <FXPickerPlugin variables={variables} />}
        {enableSingleLineEditing && <SingleLinePlugin />}
        <UpdatePlugin ref={updatePluginRef} />
        <MaxLengthPlugin maxLength={maxLength} />
        {enableLinkCreation && (
          <LinkPlugin
            attributes={{ rel: "noopener noreferrer", target: "_blank" }}
          />
        )}
        {props?.config?.editable && floatingAnchorElem && (
          <>
            <FloatingLinkToolbarPlugin
              anchorElem={floatingAnchorElem}
              isLinkInEditMode={isLinkInEditMode}
              onLinkEditModeChange={setIsLinkInEditMode}
            />
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              onLinkEditModeChange={onLinkEditModeChange}
              enableLinkCreation={enableLinkCreation}
            />
          </>
        )}
      </LexicalComposer>
    );
  }
);

const Placeholder = forwardRef(
  ({ theme, placeholder, isFocused, style = {}, ...props }: any, ref: any) => {
    return (
      <div
        className="lexical-placeholder"
        ref={ref}
        style={{
          ...style,
          ...(isFocused
            ? getPlaceholderColor(theme.color, 0.6)
            : { color: theme.color }),
        }}
        {...props}
      >
        {placeholder}
      </div>
    );
  }
);

export default Placeholder;

const EDITOR_NAMESPACE = "lexical-editor";

export const Editor = forwardRef((props: EditorProps, ref: any) => {
  const {
    editable = true,
    onChange = () => {},
    value = "",
    placeholder = "",
    theme = {},
    style = {},
    className = "",
    toolbarPlacement,
    testId,
    enableFXPicker = false,
    enableSingleLineEditing = false,
    variables = {},
    maxLength,
    autoFocus,
    onFocus = () => {},
    onBlur = () => {},
    enableLinkCreation = false,
    enableRecall = true,
    contentStyle,
  } = props;

  const formatValue = () => {
    if (value?.startsWith("<p") && value?.endsWith("</p>")) {
      return value;
    }
    return `<p>${value}</p>`;
  };

  const toolbarPlacementClass = toolbarPlacement
    ? toolbarPlacement === "down"
      ? "toolbar-down"
      : "toolbar-up"
    : undefined;

  return (
    <div
      className={`relative prose prose-slate prose-p:my-0 prose-headings:mb-4 prose-headings:mt-2 ${toolbarPlacementClass || ''} ${className}`}
      style={{ position: "relative", ...style }}
    >
      <LexicalEditor
        ref={ref}
        onChange={onChange}
        placeholder={placeholder}
        theme={theme}
        editable={editable}
        config={{
          namespace: EDITOR_NAMESPACE,
          nodes: EDITOR_NODES,
          onError: (error: Error) => {
          },
          editable,
          editorState: (editor) => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(formatValue(), "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);
            $insertNodes(nodes);
          },
          theme: PlaygroundEditorTheme,
        }}
        testId={testId}
        enableFXPicker={enableFXPicker}
        enableSingleLineEditing={enableSingleLineEditing}
        enableLinkCreation={enableLinkCreation}
        variables={variables}
        maxLength={maxLength}
        autoFocus={autoFocus}
        editorValue={value}
        onFocus={onFocus}
        onBlur={onBlur}
        enableRecall={enableRecall}
        contentStyle={contentStyle}
      />
    </div>
  );
});
