/**
 * Header Component for Ranking Dialog
 * Inspired by sheets project's Header
 */
import React from "react";
import { Label } from "@/components/ui/label";
import { RANKING_ICON } from "@/constants/Icons/questionTypeIcons";
import styles from "./Header.module.css";

interface HeaderProps {
        title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "" }) => {
        return (
                <div
                        className={styles.header_container}
                        data-testid="dialog-ranking-header"
                >
                        <img
                                src={RANKING_ICON}
                                className={styles.ranking_icon}
                                alt="Ranking"
                        />
                        <Label className="font-normal" style={{ fontFamily: "Inter" }}>
                                {title}
                        </Label>
                </div>
        );
};

