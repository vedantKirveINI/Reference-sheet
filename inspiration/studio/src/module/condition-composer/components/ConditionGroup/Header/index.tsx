import React, { useCallback, useMemo, useRef, useState } from "react";
import { ODSContextMenu, ODSLabel, ODSIcon } from "@src/module/ods";

import { deleteChildByAccessor, addChildByAccessor, cloneChildByAccessor } from "../../../utils/fieldOperations";

const CONDITION_LABEL_MAPPING = {
  and: "All of the following are true…",
  or: "Any of the following is true…",
};

function Header(props: any) {
  const {
    collector,
    schema,
    rootValues,
    condition,
    onChangeHandler,
    dataTestId,
  } = props;

  const [popper, setPopper] = useState(null);

  const addIconRef = useRef(null);

  const addConditonHandler = useCallback(
    ({ isGroup }) => {
      const newObj = { ...rootValues };
      addChildByAccessor(newObj, collector, isGroup, schema);

      onChangeHandler(newObj);
    },
    [collector, onChangeHandler, rootValues, schema]
  );

  const cloneGroupHandler = useCallback(() => {
    const newObj = { ...rootValues };
    cloneChildByAccessor(newObj, collector);

    onChangeHandler(newObj);
  }, [collector, onChangeHandler, rootValues]);

  const menuItems = useMemo(() => {
    return [
      {
        id: "1",
        name: (
          <div
            className="text-[0.813rem]"
            data-testid={`${dataTestId}-add-condition`}
          >
            Add Condition
          </div>
        ),
        onClick: () => {
          addConditonHandler({ isGroup: false });
        },
      },
      {
        id: "2",
        name: (
          <div
            className="text-[0.813rem]"
            data-testid={`${dataTestId}-add-condition-group`}
          >
            Add Condition Group
          </div>
        ),
        onClick: () => {
          addConditonHandler({ isGroup: true });
        },
      },
      {
        id: "3",
        name: (
          <div
            className="text-[0.813rem]"
            data-testid={`${dataTestId}-clone-group`}
          >
            Clone Group
          </div>
        ),
        onClick: () => {
          cloneGroupHandler();
        },
      },
    ];
  }, [addConditonHandler, cloneGroupHandler]);

  return (
    <div className="flex items-center justify-between">
      <ODSLabel variant="body1" color="#607D8B">
        {CONDITION_LABEL_MAPPING[condition]}
      </ODSLabel>

      <div className="flex items-center">
        <div
          className="flex justify-center items-center cursor-pointer rounded-lg p-2.5"
          role="presentation"
          onClick={(e) => {
            const rect = e?.currentTarget?.getBoundingClientRect();

            if (rect?.left && rect?.bottom) {
              setPopper({
                left: rect.left,
                top: rect.bottom,
              });
            }
          }}
          ref={addIconRef}
          data-testid={`${dataTestId}-add`}
        >
          <ODSIcon outeIconName="OUTEAddIcon" />
        </div>

        <div
          className="flex justify-center items-center cursor-pointer rounded-lg p-2.5"
          role="presentation"
          onClick={() => {
            const newObj = { ...rootValues };
            deleteChildByAccessor(newObj, collector);

            onChangeHandler(newObj);
          }}
          data-testid={`${dataTestId}-delete`}
        >
          <ODSIcon outeIconName="OUTETrashIcon" />
        </div>
      </div>

      <ODSContextMenu
        show={!!popper}
        menus={menuItems}
        dataTestId={`${dataTestId}-context-menu`}
        coordinates={popper}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        className="w-20"
        menuItemClassName="min-w-20"
        onClose={() => setPopper(null)}
      />
    </div>
  );
}

export default Header;
