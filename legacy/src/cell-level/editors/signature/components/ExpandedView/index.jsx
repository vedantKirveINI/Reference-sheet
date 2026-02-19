import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Pencil } from "lucide-react";

import styles from "./styles.module.scss";
import { SIGNATURE_ICON } from "../../../../../constants/Icons/questionTypeIcons";

const ExpandedView = ({
        initialValue = "",
        label = "EDIT",
        setIsExpanded = () => {},
        openDialog = () => {},
}) => {
        return (
                <div className={styles.expanded_view}>
                        <div className={styles.title_container}>
                                <div className={styles.title}>
                                        <img
                                                src={SIGNATURE_ICON}
                                                className={styles.signature_icon}
                                                alt="Signature"
                                        />
                                        <Label className="text-sm font-normal" style={{ fontFamily: "Inter" }}>
                                                Signature
                                        </Label>
                                </div>

                                <button
                                        onClick={() => setIsExpanded(() => "")}
                                        className="cursor-pointer p-0 border-0 bg-transparent"
                                >
                                        <X className="h-5 w-5 cursor-pointer" />
                                </button>
                        </div>

                        <img
                                src={initialValue}
                                className={styles.signature_url_img}
                                alt="Signature"
                        />

                        <Button
                                onClick={openDialog}
                        >
                                <Pencil className="h-4 w-4 text-white" />
                                {label}
                        </Button>
                </div>
        );
};

export default ExpandedView;
