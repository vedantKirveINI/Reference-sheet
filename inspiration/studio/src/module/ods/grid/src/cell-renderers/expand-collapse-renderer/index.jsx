import React from "react";
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSIcon as Icon } from "../../../../index.js";
import styles from './index.module.css';

function ExpandCollapseRenderer({ param }) {
  return (
    <div
      className={`${styles.normal_icon} ${
        param.data.expand ? styles.rotate_icon : ""
      }`}
    >
      <Icon
        outeIconName="OUTEChevronRightIcon"
        onClick={() => {
          param.data.expand = !param.data.expand;
          param.api.resetRowHeights();
          param.api.redrawRows();
        }}
      />
    </div>
  );
}

export default ExpandCollapseRenderer;
