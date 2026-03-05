import React from "react";
import { QuestionCreator } from "@src/module/question-creator";
import { ViewPort } from "../../../../../../module/constants";
import Footer from "../footer";
import bulb from "../../assets/bulb.svg";
import { cn } from "@/lib/utils";

const DesignTabContent = ({
  goToTab,
  showSidebar,
  mode,
  onModeChange,
  viewPort,
  onViewPortChange,
  onSave,
  onDiscard,
  scope,
}) => {
  return (
    <div
      ref={scope}
      className={cn(
        "relative left-0 flex flex-col h-full w-full min-h-0 gap-2"
      )}
    >
      <div className="flex-1 min-h-0 flex flex-col w-full h-full">
        <QuestionCreator
          goToTab={goToTab}
          showSidebar={showSidebar}
          styles={{
            height: "100%",
            width: "100%",
            minHeight: 0,
            flex: 1,
            borderRadius: "1.25rem",
            overflow: "hidden",
          }}
        />
      </div>
      {viewPort === ViewPort.DESKTOP && (
        <span
          data-testid="question-user-tip"
          className="relative h-7 text-base ml-3 font-normal leading-7 tracking-[0.00938rem] flex items-center gap-1 text-[#607d8b]"
        >
          <img
            className="w-6 h-6"
            src={bulb}
            alt="bulb"
          />
          Tip: For the best designing experience, mobile view is recommended.
        </span>
      )}
      <Footer
        mode={mode}
        onModeChange={onModeChange}
        viewPort={viewPort}
        onViewPortChange={onViewPortChange}
        onSave={onSave}
        onDiscard={onDiscard}
      />
    </div>
  );
};

export default DesignTabContent;
