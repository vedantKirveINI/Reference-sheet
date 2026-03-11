import React, { forwardRef, useImperativeHandle } from "react";
import { useState } from "react";
import { useTerminal } from './hooks/useTerminal.jsx';
import { getDefaultStyles } from './utils/terminalUtils.jsx';
import TerminalOutput from './components/TerminalOutput.jsx';
import StatusBar from './components/StatusBar.jsx';
import styles from './Terminal.module.css';

const Terminal = forwardRef(
  (
    {
      data = [],
      onClearTerminal = () => {},
      containerStyle = {},
      outputStyle = {},
      className = "",
      height = "100%",
      width = "100%",
      maxWidth = "",
      showStatusBar = true,
    },
    ref
  ) => {
    const [showOnlyErrors, setShowOnlyErrors] = useState(false);
    const [showVerbose, setShowVerbose] = useState(true);

    const { history, terminalRef, handleScroll, clearTerminal } = useTerminal(
      data,
      showOnlyErrors,
      showVerbose,
      onClearTerminal
    );

    const defaultStyles = getDefaultStyles(height, width, maxWidth);

    useImperativeHandle(
      ref,
      () => ({
        clearTerminal,
        updateShowVerbose: (value) => setShowVerbose(value),
        updateShowOnlyErrors: (value) => setShowOnlyErrors(value),
      }),
      [clearTerminal, setShowOnlyErrors, setShowVerbose]
    );

    return (
      <div
        className={`${styles.terminalContainer} ${className}`}
        style={{
          ...defaultStyles.container,
          ...containerStyle,
        }}
      >
        <TerminalOutput
          history={history}
          terminalRef={terminalRef}
          handleScroll={handleScroll}
          outputStyle={{
            ...defaultStyles.output,
            ...outputStyle,
          }}
        />

        {showStatusBar && (
          <StatusBar
            showOnlyErrors={showOnlyErrors}
            setShowOnlyErrors={setShowOnlyErrors}
            showVerbose={showVerbose}
            setShowVerbose={setShowVerbose}
            clearTerminal={clearTerminal}
          />
        )}
      </div>
    );
  }
);

export default Terminal;
