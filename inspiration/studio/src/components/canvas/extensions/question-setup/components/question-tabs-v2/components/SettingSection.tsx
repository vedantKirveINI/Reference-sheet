import { ReactNode } from "react";

interface SettingSectionProps {
  title?: string;
  children: ReactNode;
  showDivider?: boolean;
}

const SettingSection = ({ title, children, showDivider = true }: SettingSectionProps) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        {title && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </div>
        )}
        {children}
      </div>
      {showDivider && <div className="h-px bg-gray-200 my-2" />}
    </>
  );
};

export default SettingSection;
