import { useEffect, JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, RootNode } from "lexical";

const newlinesRegex = /[\n\r]/g;

/**
 * Registers a node transform for the RootNode based on the text content.
 *
 * @param {RootNode} rootNode - The RootNode to transform
 * @return {void}
 */
export function SingleLinePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Set the editor to not editable - it won't take focus while in that state
    // https://github.com/facebook/lexical/issues/4474
    editor.setEditable(false);

    const unregister = editor.registerNodeTransform(
      RootNode,
      (rootNode: RootNode) => {
        const textContent = rootNode.getTextContent();
        const nodes = rootNode.getAllTextNodes();
        if (newlinesRegex.test(textContent)) {
          const paragraph = $createParagraphNode();
          paragraph.append(...nodes);
          rootNode.clear().append(paragraph);
          rootNode.selectEnd();
        }
      }
    );

    // Set the editor back to editable a frame later
    requestAnimationFrame(() => editor.setEditable(true));

    return unregister;
  }, [editor]);

  return null;
}
