import React from "react";

import { CONTACT_PHONE_ICON } from "@/constants/Icons/questionTypeIcons";

import styles from "./styles.module.scss";

const Header = () => {
        return (
                <div className={styles.header_container}>
                        <img
                                src={CONTACT_PHONE_ICON}
                                className={styles.address_icon}
                                alt="Contact"
                        />
                        <div className={styles.header_label}>Contact</div>
                </div>
        );
};

export default Header;
