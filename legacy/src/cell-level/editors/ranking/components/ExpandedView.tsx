import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Pencil } from "lucide-react";
import { RANKING_ICON } from "@/constants/Icons/questionTypeIcons";
import styles from "./ExpandedView.module.css";

interface RankingItem {
        id: string;
        rank: number;
        label: string;
}

interface ExpandedViewProps {
        ranking: RankingItem[];
        variant?: "black" | "black-outlined";
        label?: string;
        setIsExpanded: (value: "" | "expanded_view" | "open_dialog") => void;
        openDialog: () => void;
        title?: string;
}

export const ExpandedView: React.FC<ExpandedViewProps> = ({
        ranking = [],
        label = "EDIT",
        setIsExpanded,
        openDialog,
        title = "",
}) => {
        return (
                <div className={styles.expanded_view}>
                        <div className={styles.title_container}>
                                <div
                                        className={styles.title}
                                        data-testid="popover-ranking-header"
                                >
                                        <img
                                                src={RANKING_ICON}
                                                className={styles.ranking_icon}
                                                alt="Ranking"
                                        />
                                        <Label className="text-sm font-normal" style={{ fontFamily: "Inter" }}>
                                                {title}
                                        </Label>
                                </div>

                                <button
                                        onClick={() => setIsExpanded("")}
                                        className="cursor-pointer p-0 border-0 bg-transparent"
                                >
                                        <X className="h-5 w-5 cursor-pointer" />
                                </button>
                        </div>

                        <div className={styles.rank_list} data-testid="ranking-list">
                                {ranking.map((element) => {
                                        return (
                                                <div
                                                        key={element.id}
                                                        className={styles.rank_item}
                                                        data-testid={`ranking-item-${element.rank}`}
                                                >
                                                        <span
                                                                className="text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                                                        >{`${element.rank}. ${element.label}`}</span>
                                                </div>
                                        );
                                })}
                        </div>

                        <Button
                                onClick={openDialog}
                        >
                                <Pencil className="h-4 w-4 text-white" />
                                {label}
                        </Button>
                </div>
        );
};
