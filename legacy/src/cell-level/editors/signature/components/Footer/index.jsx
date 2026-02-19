import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

import styles from "./styles.module.scss";

const Footer = ({ onClose = () => {}, onSave = () => {}, loading = false }) => {
        return (
                <div className={styles.footer_container}>
                        <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                        >
                                DISCARD
                        </Button>
                        <Button
                                onClick={onSave}
                                disabled={loading}
                        >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                SAVE
                        </Button>
                </div>
        );
};

export default Footer;
