import React, { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, arraySwap, rectSortingStrategy } from "@dnd-kit/sortable";
import { cloneDeep, isEmpty } from "lodash-es";
import { generateIndices, incrementRanks } from "./utils/helper";
import DndKitProvider from "./provider/dnd-kit-provider";
import RankerSortableWrapper from "./ranker-sortable-wrapper";
import { Mode, QuestionAlignments } from "@/module/constants";
import { getRankingOptions } from "./utils/get-ranking-options";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface IOption {
  id: string;
  rank: number | null;
  label: string;
}

export type RankingProps = {
  value: any | IOption[];
  options: IOption[];
  onChange: any;
  isCreator: boolean;
  question?: any;
  mode?: Mode;
  theme?: any;
  answers?: any;
  isAnswered?: boolean;
};

const getString = (opts) => {
  return opts?.reduce((acc, item, i) => {
    return acc + (i > 0 ? ", " : "") + item?.label;
  }, "");
};

export function Ranking({
  value = [],
  options,
  isCreator,
  onChange,
  question,
  mode,
  theme = {},
  answers = {},
  isAnswered = false,
}: RankingProps) {
  const [rankingOptions, setRankingOptions] = useState([]);
  React.useEffect(() => {
    if (isCreator) {
      setRankingOptions(value);
      return;
    }
    if (!isAnswered) {
      const rankingOpts = getRankingOptions(
        cloneDeep(options),
        question?.settings,
        answers
      );
      setRankingOptions(rankingOpts);
      return;
    }
    if (isEmpty(rankingOptions)) {
      setRankingOptions(value?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areOptionsDynamicallyControlled =
    question?.settings?.dynamicInput?.isActive;

  const handleOptionDelete = (index: number) => {
    const newOptions = [...rankingOptions];
    newOptions.splice(index, 1);
    setRankingOptions(newOptions);
    onChange(newOptions);
  };

  const handleValueChange = (data, optionIndex: number) => {
    const newOptions = rankingOptions.map((option, index) =>
      optionIndex === index ? { ...option, label: data } : option
    );
    setRankingOptions(newOptions);
    onChange(newOptions);
  };

  const handleRankChange = (rank, rankIndex: number) => {
    const newOptions = [...rankingOptions];
    const swapFromIndex = rankIndex;
    const swapToIndex = rank - 1;
    const swappedOptions = arraySwap(newOptions, swapFromIndex, swapToIndex);
    const rankedOptions = incrementRanks(swappedOptions);
    setRankingOptions(rankedOptions);
    onChange({
      value: rankedOptions,
      __to_string: getString(rankedOptions),
    });
  };

  const handleAddOptions = () => {
    const newOption: IOption = {
      id: crypto?.randomUUID() || new Date().getTime()?.toString(),
      rank: null,
      label: "",
    };
    const newOptions = [...rankingOptions, newOption];
    setRankingOptions(newOptions);
    onChange(newOptions);
  };

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    const newOptions = [...rankingOptions];
    const activeIndex = newOptions.findIndex(
      (option) => option.id === active.id
    );
    const overIndex = newOptions.findIndex((option) => option.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;
    const movedArray = arrayMove(newOptions, activeIndex, overIndex);
    if (isCreator) {
      setRankingOptions(movedArray);
      onChange(movedArray);
    } else {
      const rankedOptions = incrementRanks(movedArray);
      setRankingOptions(rankedOptions);
      onChange({
        value: rankedOptions,
        __to_string: getString(rankedOptions),
      });
    }
  }

  const handleClearOptions = () => {
    let newValue = [];
    setRankingOptions((prev) => {
      newValue = prev?.map?.((option) => ({ ...option, rank: null })) || [];
      return newValue;
    });
    onChange({
      value: newValue,
      __to_string: "",
    });
  };

  const dropDownOptions = generateIndices(rankingOptions);

  const hasRankedOptions =
    rankingOptions.length > 0 &&
    rankingOptions.some((opt) => opt.rank != null && opt.rank !== "");

  const isCenterAligned =
    mode === Mode.CARD &&
    question?.settings?.questionAlignment === QuestionAlignments.CENTER;

  return (
    <section
      className={cn(
        "flex w-full flex-col",
        isCenterAligned ? "items-center" : "items-start"
      )}
      data-testid="ranking-root"
    >
      {areOptionsDynamicallyControlled && isCreator ? (
        <h3
          className="m-0 rounded-md border border-black/10 bg-white/30 p-4 text-base font-normal tracking-[0.25px] backdrop-blur-[7px] backdrop-saturate-200"
          data-testid="ranking-dynamic-options-header"
        >
          Options are controlled by settings
        </h3>
      ) : (
        <DndKitProvider onDragEnd={onDragEnd}>
          <SortableContext
            items={rankingOptions}
            strategy={rectSortingStrategy}
          >
            <div className="grid w-max grid-cols-1 gap-5" data-testid="ranking-options-container">
              {rankingOptions.map((option, index: number) => {
                return (
                  <RankerSortableWrapper
                    key={option.id}
                    id={option.id}
                    isCreator={isCreator}
                    index={index}
                    showDeleteButton={rankingOptions.length > 1}
                    onDelete={(index) => {
                      handleOptionDelete(index);
                    }}
                    onRankChange={({ rank, index }) => {
                      handleRankChange(rank, index);
                    }}
                    onValueChange={({ data, index }) => {
                      handleValueChange(data, index);
                    }}
                    value={option}
                    dropDownOptions={dropDownOptions}
                    theme={theme}
                  />
                );
              })}
              {isCreator && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 w-fit gap-1.5 rounded-md border border-dashed px-3 text-xs font-medium transition-colors hover:opacity-90",
                    !theme?.styles?.buttons &&
                      "border-border bg-transparent text-muted-foreground"
                  )}
                  style={
                    theme?.styles?.buttons
                      ? {
                          color: theme.styles.buttons,
                          borderColor: theme.styles.buttons,
                          backgroundColor: "transparent",
                        }
                      : undefined
                  }
                  data-testid="add-choice"
                  onClick={handleAddOptions}
                >
                  <icons.add className="size-3.5 shrink-0" />
                  Add Choice
                </Button>
              )}
              {!isCreator && hasRankedOptions && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-fit gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 text-xs font-medium text-destructive transition-colors hover:border-destructive/50 hover:bg-destructive/15 hover:text-destructive"
                  data-testid="remove-choice"
                  onClick={handleClearOptions}
                >
                  <icons.trash2 className="size-3.5 shrink-0" />
                  Clear all
                </Button>
              )}
            </div>
          </SortableContext>
        </DndKitProvider>
      )}
    </section>
  );
}
