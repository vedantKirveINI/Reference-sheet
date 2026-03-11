import { useEffect, useRef } from "react";
import { ODSIcon as Icon } from '@src/module/ods';
import { styles } from "./styles";

export interface InfoCardProps {
  helperText: any;
  style?: any;
  onClickAway?: () => void;
}

export function InfoCard({
  helperText,
  style = {},
  onClickAway = () => {},
}: InfoCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickAway();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickAway]);

  return (
    <div
      ref={ref}
      style={{ ...styles.container, ...style }}
      data-testid="cta-helper-container"
    >
      <Icon
        outeIconName="OUTEInfoIcon"
        outeIconProps={{
          "data-testid": "cta-helper-icon",
          sx: styles.icon,
        }}
      />
      {helperText}
    </div>
  );
}
