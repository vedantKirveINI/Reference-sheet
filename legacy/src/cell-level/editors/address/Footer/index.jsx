import { Button } from "@/components/ui/button";
import React from "react";

import styles from "./styles.module.scss";

function Footer({ handleAllFieldsClear = () => {}, handleSubmit = () => {} }) {
        return (
                <div className={styles.footer_container}>
                        <Button
                                variant="outline"
                                onClick={handleAllFieldsClear}
                        >
                                CLEAR ALL
                        </Button>
                        <Button onClick={handleSubmit}>SAVE</Button>
                </div>
        );
}

export default Footer;
