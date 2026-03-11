/**
 * @deprecated Use ArrayAggregatorV3 from array-aggregator-v3/ instead.
 * This component uses the legacy TabContainer pattern and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based ArrayAggregatorV3.
 */
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import _ from "lodash";

import { getAggregatorSources } from "./utils";
import TabContainer from "../common-components/TabContainer";
import ARRAY_AGGREGATOR_NODE from "./constant";
import Configure from "./tabs/configure/Configure";

const ArrayAggregator = forwardRef(
  ({ data, variables, getNodes, onSave = () => {} }, ref) => {
    const sources = getAggregatorSources(variables);
    const [source, setSource] = useState(data.source || null);

    const [aggregateOnFields, setAggregateOnFields] = useState([]);
    const [editedAggregateOnFields, setEditedAggregateOnFields] = useState([]);
    const [aggregateOnNodes, setAggregateOnNodes] = useState();

    const emptyField = [
      {
        rowid: _.uniqueId(Date.now()),
        expand: true,
        response_type: "string",
        key: "",
        filter_condition: { type: "fx", blocks: [] },
        schema: [],
      },
    ];
    const gridRef = useRef();

    const onAddAggregate = useCallback(() => {
      const newAggregate = {
        rowid: _.uniqueId(Date.now()),
        expand: true,
        response_type: "string",
        key: "",
        filter_condition: { type: "fx", blocks: [] },
        schema: [],
      };

      setEditedAggregateOnFields((prev) => {
        const updated = [...prev, newAggregate];
        setAggregateOnFields(updated);
        return updated;
      });
    }, []);

    const onRemoveAggregate = useCallback((rowid) => {
      setAggregateOnFields((prevAggregateOnFields) => {
        const updatedAggregateOnFields = prevAggregateOnFields.filter(
          (row) => row.rowid !== rowid
        );
        return updatedAggregateOnFields;
      });

      setEditedAggregateOnFields((prevEditedAggregateOnFields) => {
        const updatedEditedAggregateOnFields =
          prevEditedAggregateOnFields.filter((row) => row.rowid !== rowid);
        return updatedEditedAggregateOnFields;
      });
    }, []);

    const onUpdateAggregate = useCallback((index, field, value) => {
      setEditedAggregateOnFields((prev) => {
        const updated = prev.map((item, idx) => {
          if (idx === index) {
            return {
              ...item,
              [field]: value,
            };
          }
          return item;
        });
        setAggregateOnFields(updated);
        return updated;
      });
    }, []);

    const updateAggregateOnNodes = useCallback(
      async (node) => {
        const nodesBetween = await getNodes({ fetchNodesFrom: node?.key });
        const NODE = variables?.NODE?.filter((vn) => {
          return nodesBetween.findIndex((n) => n.data.key === vn.key) !== -1;
        });
        setAggregateOnNodes({ NODE });
      },
      [getNodes, variables?.NODE]
    );

    const initializeArrayAggregator = useCallback(
      async (sourceIterator, rowData) => {
        if (!sources?.find((ele) => ele?.key === source?.key)) {
          setEditedAggregateOnFields(emptyField);
          setAggregateOnFields(emptyField);
          return;
        }
        if (sourceIterator) {
          await updateAggregateOnNodes(sourceIterator);
        }

        // If no rowData provided, initialize with one empty aggregate
        const initialData =
          rowData && rowData.length > 0 ? rowData : emptyField;

        setEditedAggregateOnFields(initialData);
        setAggregateOnFields(initialData);
      },
      [updateAggregateOnNodes]
    );

    const tabs = useMemo(
      () => [
        {
          label: "Configure",
          panelComponent: Configure,
          panelComponentProps: {
            sources,
            source,
            setSource,
            initializeArrayAggregator,
            editedAggregateOnFields,
            aggregateOnFields,
            gridRef,
            variables,
            aggregateOnNodes,
            onAddAggregate,
            onRemoveAggregate,
            onUpdateAggregate,
          },
        },
      ],
      [
        aggregateOnFields,
        editedAggregateOnFields,
        initializeArrayAggregator,
        source,
        sources,
        variables,
        aggregateOnNodes,
        onAddAggregate,
        onRemoveAggregate,
        onUpdateAggregate,
      ]
    );

    useImperativeHandle(ref, () => {
      return {
        getData: () => {
          return {
            source,
            aggregateOnFields: editedAggregateOnFields,
          };
        },
      };
    }, [editedAggregateOnFields, source]);

    useEffect(() => {
      // Initialize the array aggregator
      initializeArrayAggregator(data?.source, data?.aggregateOnFields || []);
    }, [initializeArrayAggregator, data?.aggregateOnFields, data?.source]);

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: ARRAY_AGGREGATOR_NODE.dark,
          light: ARRAY_AGGREGATOR_NODE.light,
          foreground: ARRAY_AGGREGATOR_NODE.foreground,
        }}
        hasTestTab={ARRAY_AGGREGATOR_NODE.hasTestModule}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default ArrayAggregator;
