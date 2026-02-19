import React from "react";
import { Button } from "@/components/ui/button";
import styles from "./FileViewerFooter.module.css";

interface FileViewerFooterProps {
        onClose: () => void;
        onAddFiles: () => void;
}

export const FileViewerFooter: React.FC<FileViewerFooterProps> = ({
        onClose,
        onAddFiles,
}) => {
        return (
                <div className={styles.footer_container}>
                        <Button
                                variant="outline"
                                onClick={onClose}
                        >
                                CLOSE
                        </Button>
                        <Button onClick={onAddFiles}>ADD MORE</Button>
                </div>
        );
};
