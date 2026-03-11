import React, { useMemo } from "react";
import styles from "./styles.module.css";

const escapeHtml = (text) => {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const MarkdownRenderer = ({ content, accentColor = "#3b82f6" }) => {
  const markdownContent = useMemo(() => {
    if (typeof content === "string") {
      return content;
    }
    if (content?.text) {
      return content.text;
    }
    if (content?.content) {
      return content.content;
    }
    if (content?.result) {
      return typeof content.result === "string" 
        ? content.result 
        : JSON.stringify(content.result, null, 2);
    }
    return JSON.stringify(content, null, 2);
  }, [content]);

  const renderedHtml = useMemo(() => {
    if (!markdownContent) return "";

    let html = escapeHtml(markdownContent);

    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="${styles.codeBlock}"><code>${code.trim()}</code></pre>`;
    });

    html = html.replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

    html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (isValidUrl(url)) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return text;
    });

    html = html.replace(/\n\n/g, "</p><p>");
    html = `<p>${html}</p>`;

    return html;
  }, [markdownContent]);

  return (
    <div 
      className={styles.markdownContainer}
      style={{ "--accent-color": accentColor }}
    >
      <div 
        className={styles.markdownContent}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
};

export default MarkdownRenderer;
