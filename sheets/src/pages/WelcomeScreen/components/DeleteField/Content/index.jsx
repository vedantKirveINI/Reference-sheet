import React from "react";

import styles from "./styles.module.scss";

function Content({ content = "" }) {
	return <div className={styles.content_container}>{content}</div>;
}

export default Content;
