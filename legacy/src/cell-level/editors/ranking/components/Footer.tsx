/**
 * Footer Component for Ranking Dialog
 * Inspired by sheets project's Footer
 */
import React from "react";
import { Button } from "@/components/ui/button";
import styles from "./Footer.module.css";

interface FooterProps {
        handleClose?: () => void;
        handleSave?: () => void;
        disabled?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
        handleClose = () => {},
        handleSave = () => {},
        disabled = false,
}) => {
        return (
                <div className={styles.footer_container}>
                        <Button
                                variant="outline"
                                onClick={handleClose}
                        >
                                DISCARD
                        </Button>
                        <Button
                                onClick={handleSave}
                                disabled={disabled}
                        >
                                SAVE
                        </Button>
                </div>
        );
};
