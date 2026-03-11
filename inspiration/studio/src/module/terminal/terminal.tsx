import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./terminal.module.css";
import { AnimatePresence, LazyMotion } from "framer-motion";

import TerminalFooter from "./components/terminal-footer";
import { LogContent } from "./components/log-content";
import { TerminalLogData } from "./types";

const loadFeatures = () =>
  import("./utils/framer-dom-animation-features").then(
    (res) => res.domAnimation
  );

export interface TerminalProps {
  logs: TerminalLogData[];
  onClearTerminal: () => void;
  verbose?: boolean;
  onCollapseToggle: (collapsed: boolean) => void;
  title?: React.ReactNode | string;
  showHeader?: boolean;
  showClearTerminal?: boolean;
  hasStreaming?: boolean;
}

export const Terminal = ({
  logs,
  onClearTerminal,
  verbose: initialVerbose = false,
  onCollapseToggle,
  title,
  showHeader = true,
  showClearTerminal = false,
  hasStreaming = false,
}: TerminalProps) => {
  const [verbose, setVerbose] = useState(initialVerbose);
  const [showErrorOnly, setShowErrorOnly] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasStreaming && scrollRef.current && !userScrolled) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs, userScrolled]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setUserScrolled(!isAtBottom);
    }
  }, []);

  return (
    <LazyMotion features={loadFeatures}>
      <div
        className={`${styles.container} terminal-container 
        ${showHeader ? styles.showHeader : styles.hideHeader}`}
      >
        {/* Header */}
        {showHeader && (
          <div className={`${styles.header} terminal-header`}>
            {!collapsed && (
              <>
                <div className={`${styles.title} terminal-title`}>{title}</div>

                <div className={`${styles.separator} terminal-separator`}></div>
              </>
            )}
            <img
              src="https://cdn-v1.tinycommand.com/1234567890/1755001180740/drawer-close.svg"
              alt="Toggle terminal"
              className="terminal-collapse-icon"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setCollapsed(!collapsed);
                onCollapseToggle(!collapsed);
              }}
            />
          </div>
        )}

        <div
          className={`${styles.logs} terminal-logs`}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {!collapsed && (
            <>
              {logs.filter((log) => !showErrorOnly || log.type === "error")
                .length === 0 ? (
                <div className={`${styles.noLogs} terminal-no-logs`}>
                  No logs to show
                </div>
              ) : (
                <AnimatePresence>
                  {logs
                    .filter((log) => !showErrorOnly || log.type === "error")
                    .map((log, index) => {
                      return (
                        <LogContent
                          key={index}
                          log={log}
                          index={index}
                          isVerbose={verbose}
                        />
                      );
                    })}
                </AnimatePresence>
              )}
            </>
          )}
        </div>

        {!collapsed && (
          <TerminalFooter
            verbose={verbose}
            showErrorOnly={showErrorOnly}
            onVerboseChange={setVerbose}
            onShowErrorOnlyChange={setShowErrorOnly}
            onClearTerminal={onClearTerminal}
            showClearTerminal={showClearTerminal}
          />
        )}
      </div>
    </LazyMotion>
  );
};
