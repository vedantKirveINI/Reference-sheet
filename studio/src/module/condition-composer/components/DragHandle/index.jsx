import { ODSIcon } from "@src/module/ods";
import { forwardRef } from "react";

function DragHandle(prop, ref) {
  return (
    <div ref={ref} {...prop} className="touch-none cursor-grab outline-none border-none bg-transparent p-0">
      <ODSIcon>
        <svg viewBox="0 0 20 20" className="m-auto w-[14px] h-[24px] align-middle fill-[#919eab]">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </ODSIcon>
    </div>
  );
}

export default forwardRef(DragHandle);
