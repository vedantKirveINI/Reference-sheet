import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isEmpty } from "lodash";
import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import styles from "./SortableItem.module.css";

interface RankingItem {
        id: string;
        rank: number;
        label: string;
}

interface SortableItemProps {
        element: RankingItem;
        ranking: RankingItem[];
        options: RankingItem[];
        handleChange: (value: RankingItem | null, index: number) => void;
        index: number;
}

export const SortableItem: React.FC<SortableItemProps> = ({
        element = {} as RankingItem,
        ranking = [],
        options = [],
        handleChange = () => {},
        index = 0,
}) => {
        const { attributes, listeners, setNodeRef, transform } = useSortable({
                id: element.id,
        });

        const style = {
                transform: CSS.Transform.toString(transform),
                transition: transform ? "transform 150ms ease" : "none",
        };

        const rankingOptions = (isEmpty(ranking) ? options : ranking).map(
                (item, idx) => ({
                        ...item,
                        rank: item.rank ?? idx + 1,
                }),
        );

        const selectedValue = element.rank
                ? rankingOptions.find((opt) => opt.rank === element.rank) || null
                : { id: "", rank: 0, label: "" };

        return (
                <div
                        ref={setNodeRef}
                        style={style}
                        className={`${styles.content} ${index === 0 ? styles.first_item : ""}`}
                        data-testid={`sortable-ranking-item-${index}`}
                >
                        <select
                                data-testid={`ods-autocomplete-${element.id}`}
                                value={selectedValue?.rank ?? ""}
                                onChange={(e) => {
                                        const rankNum = Number(e.target.value);
                                        const found = rankingOptions.find((opt) => opt.rank === rankNum) || null;
                                        handleChange(found, index);
                                }}
                                className="h-full border-0 border-r border-solid border-[#B0BEC5] bg-transparent text-center outline-none cursor-pointer"
                                style={{ width: "17%", borderRadius: 0 }}
                        >
                                {rankingOptions.map((opt) => (
                                        <option key={opt.id} value={opt.rank}>
                                                {opt.rank}
                                        </option>
                                ))}
                        </select>

                        <Input
                                data-testid="ranking-label"
                                value={element.label}
                                readOnly
                                className="w-full border-0 cursor-auto pl-2"
                        />

                        <div {...listeners} {...attributes} style={{ cursor: "grab" }}>
                                <GripVertical className="h-6 w-6 text-[#607D8B]" />
                        </div>
                </div>
        );
};
