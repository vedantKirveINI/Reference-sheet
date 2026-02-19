import { Label } from "@/components/ui/label";

import styles from "./styles.module.scss";
import { SIGNATURE_ICON } from "../../../../../constants/Icons/questionTypeIcons";

function Header({ title = "" }) {
        return (
                <div className={styles.header_container}>
                        <img
                                src={SIGNATURE_ICON}
                                className={styles.signature_icon}
                                alt="Signature"
                        />
                        <Label className="font-normal" style={{ fontFamily: "Inter" }}>
                                {title}
                        </Label>
                </div>
        );
}

export default Header;
