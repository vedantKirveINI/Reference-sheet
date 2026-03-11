import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Label from "oute-ds-label";
import { ODSAutocomplete as Autocomplete, ODSLabel as Label, ODSCheckbox, ODSIcon as Icon } from "@src/module/ods";
import assetSDKServices from "../../../services/assetSDKServices";
import { canvasSDKServices } from "../../../services/canvasSDKServices";
// import ODSCheckbox from "oute-ds-checkbox";
// import Icon from "oute-ds-icon";
import { QuestionType } from "../../../../../module/constants";
import { QUESTIONS_NODES } from "../../question-setup/constants/questionNodes";
import classes from "./formTrigger.module.css";

const FORM_EVENTS = Object.freeze({
  FORM_SUBMITTED: {
    id: "SUBMITTED",
    label: "Submitted",
    info: "Triggers on successful completion",
  },
  // FORM_STARTED: {
  //   id: "FORM_STARTED",
  //   label: "Form Started",
  //   info: "Triggers at first user interaction",
  // },
  // FORM_ABANDONED: {
  //   id: "FORM_ABANDONED",
  //   label: "Form Abandoned",
  //   info: "Triggers when form is abandoned after inactivity",
  // },
});

const FormTriggerNode = forwardRef(({ workspaceId, data }, ref) => {
  const [listOfForms, setListOfForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(data?.form);
  const [selectedEvent, setSelectedEvent] = useState(
    data?.event || FORM_EVENTS.FORM_SUBMITTED
  );
  const [formQuestions, setFormQuestions] = useState([]);
  const [selectedNode, setSelectedNode] = useState(data?.activeNode || {});

  // const [idleDuration, setIdleDuration] = useState(data?.idleDuration || 10);
  const validTypes = Object.values(QuestionType);

  const toggleCheckbox = (nodeId, checked, node) => {
    if (checked) {
      setSelectedNode((prevSelectedNode) => ({
        ...prevSelectedNode,
        [nodeId]: node,
      }));
    } else {
      setSelectedNode((prevSelectedNode) => {
        const newMapping = { ...prevSelectedNode };
        delete newMapping[nodeId];
        return newMapping;
      });
    }
  };

  const validateData = useCallback(() => {
    const errors = [];
    if (!selectedForm) {
      errors.push("Please select a form");
    }
    return errors;
  }, [selectedForm]);

  useImperativeHandle(
    ref,
    () => ({
      getData: () => ({
        form: selectedForm,
        event: selectedEvent,
        activeNode: selectedNode,
        // idleDuration,
      }),
      validateData,
    }),
    [validateData, selectedForm, selectedEvent, selectedNode]
  );

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const query = {
          workspace_id: workspaceId,
          annotation: "FC",
          published_only: true,
          sort_by: "edited_at",
          sort_type: "desc",
        };

        const res = await assetSDKServices.getFlatList(query);
        const filteredForms = res.result;
        setListOfForms(filteredForms);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      }
    };

    if (workspaceId) {
      fetchForms();
    }
  }, [workspaceId]);

  async function fetchForms(selectedForm) {
    const query = { asset_id: selectedForm.asset_id };
    const res = await canvasSDKServices.getPublishedByAsset(query);
    return res?.result?.flow ?? {};
  }

  const nodeToDisplay = async ({ selectedForm }) => {
    setSelectedForm(selectedForm);
    const formData = await fetchForms(selectedForm);
    setFormQuestions(formData);

    const allNodes = Object.entries(formData).reduce((acc, [id, node]) => {
      if (
        validTypes.includes(node?.type) &&
        node?.type !== "WELCOME" &&
        node?.type !== "ENDING"
      ) {
        acc[id] = node;
      }
      return acc;
    }, {});

    setSelectedNode(allNodes);
  };

  useEffect(() => {
    const loadFormData = async () => {
      if (selectedForm) {
        const formData = await fetchForms(selectedForm);
        setFormQuestions(formData);
      }
    };

    loadFormData();
  }, []);

  let form = Object.entries(formQuestions).map(([id, node]) => ({
    id,
    type: node?.type,
    name: node.config?.name,
    _raw: node,
  }));

  //to allow only question nodes

  const questionNodes = form.filter(
    (q) =>
      validTypes.includes(q.type) && q.type !== "WELCOME" && q.type !== "ENDING"
  );

  return (
    <div className={classes["form-trigger-container"]}>
      <div>
        <Label variant="h6" fontWeight="600" required data-testid="form-label">
          Select a form
        </Label>
        <div className={classes["label-container"]}>
          <Label
            variant="subtitle1"
            color="#607D8B"
            data-testid="form-description"
          >
            Select the form whose submissions you want to use as a trigger.
          </Label>
          <Autocomplete
            options={listOfForms}
            fullWidth
            variant="black"
            searchable={true}
            data-testid="select-form"
            disableClearable={false}
            textFieldProps={{
              placeholder: "Select form",
            }}
            value={selectedForm}
            getOptionLabel={(option) => option?.name}
            isOptionEqualToValue={(option, value) =>
              option?._id === (value?._id ?? value?.asset_id)
            }
            onChange={(e, value) => {
              if (value) {
                const { _id: asset_id, type, annotation, name } = value;

                const filteredForm = {
                  asset_id,
                  type,
                  annotation,
                  name,
                };
                nodeToDisplay({ selectedForm: filteredForm });
              } else {
                setSelectedForm(null);
                setSelectedNode({});
              }
            }}
            renderOption={(props, option) => (
              <li {...props} key={props?._id}>
                {option?.name}
              </li>
            )}
          />
        </div>
      </div>
      <div>
        <Label variant="h6" fontWeight="600" required data-testid="event-label">
          Select an event
        </Label>
        <div className={classes["label-container"]}>
          <Label
            variant="subtitle1"
            color="#607D8B"
            data-testid="event-description"
          >
            Select the event you want to use as a trigger.
          </Label>
          <Autocomplete
            fullWidth
            variant="black"
            data-testid="select-event"
            options={Object.values(FORM_EVENTS)}
            getOptionLabel={(option) => option?.label}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            value={selectedEvent}
            onChange={(e, value) => {
              setSelectedEvent(value);
              // if (value?.id === FORM_EVENTS?.FORM_ABANDONED?.id) {
              //   setIdleDuration(10);
              // } else {
              //   setIdleDuration(null);
              // }
            }}
          />
        </div>
      </div>

      {selectedForm ? (
        <div>
          <Label variant="h6" fontWeight="600" data-testid="selection-label">
            Select Questions for Node Mapping
          </Label>
          <div className={classes["form-container"]}>
            <Label
              variant="subtitle1"
              color="#607D8B"
              data-testid="selection-description"
            >
              Select the questions you want to map to the nodes added after the
              trigger. This will allow data from the form to flow seamlessly
              through your workflow.
            </Label>

            <div
              className={classes["form-group"]}
              data-testid="form-node-container"
            >
              <Label variant="capital" color="#607D8B" data-testid="form-label">
                Select questions
              </Label>
              {questionNodes.map((q, index) => {
                const isChecked = Boolean(
                  Object.keys(selectedNode).includes(q.id)
                );
                return (
                  <div
                    key={q.id}
                    className={classes["form-item"]}
                    data-testid={`form-node-${index}`}
                  >
                    <ODSCheckbox
                      variant="black"
                      data-testid={`${q.type}-checkbox-${index}`}
                      checked={isChecked}
                      onChange={(e) =>
                        toggleCheckbox(q.id, e.target.checked, q._raw)
                      }
                    />
                    <Icon
                      imageProps={{
                        src: QUESTIONS_NODES[q.type]?._src,
                        style: { width: "1.25rem", height: "1.25rem" },
                        dataTestId: `${q.type}-icon-${index}`,
                      }}
                    />
                    <Label variant="subtitle1" data-testid={`${q.type}-name`}>
                      {q.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* {selectedEvent?.id === FORM_EVENTS?.FORM_ABANDONED?.id && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <Label>
            Idle duration before considering it abandonment (in minutes)
          </Label>
          <TextField
            defaultValue={idleDuration}
            type="number"
            className="black"
            fullWidth
            onChange={(e) => {
              setIdleDuration(e.target.value);
            }}
          />
        </div>
      )} */}
    </div>
  );
});

export default FormTriggerNode;
