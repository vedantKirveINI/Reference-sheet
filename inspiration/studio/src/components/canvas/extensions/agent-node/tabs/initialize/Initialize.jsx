import classes from "./index.module.css";
import { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
import agentLottie from "../../assets/agent.json";
// import { ODSTextField as TextField } from "@src/module/ods";
// import { ODSIcon } from "@src/module/ods";
import { ODSTextField as TextField, ODSIcon } from "@src/module/ods";
import assetSDKServices from "../../../../services/assetSDKServices";
import _ from "lodash";
import AgentsList from "../../components/AgentsList";
import AgentsListLoader from "../../components/AgentsListLoader";
export const Initialize = ({
  data,
  setValidTabIndices,
  setError,
  workspaceId,
  selectedAgent,
  setSelectedAgent,
}) => {
  const [agents, setAgents] = useState([]);
  const [agentsToShow, setAgentsToShow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isValid = !!selectedAgent;

    setValidTabIndices((prev) => {
      if (isValid) {
        if (!prev?.includes(0)) {
          return [...prev, 0];
        }
        return prev;
      } else {
        return prev?.filter((index) => index !== 0);
      }
    });
    setError((prev) => ({
      ...prev,
      0: isValid ? [] : ["Please select an agent"],
    }));
  }, [data, setValidTabIndices, setError, selectedAgent]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const query = {
          workspace_id: workspaceId,
          annotation: "AGENT",
          sort_by: "edited_at",
          sort_type: "desc",
        };

        const res = await assetSDKServices.getFlatList(query);
        const filteredForms = res.result;
        setAgents(filteredForms);
        if (data?.asset_id) {
          const selected = filteredForms?.find(
            (item) => item?._id === data?.asset_id
          );
          if (selected) {
            setSelectedAgent(selected);
          }
        }
        setAgentsToShow(filteredForms);
      } catch {
        // Error handling - could be enhanced with user-facing error message
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchForms();
    }
  }, [data?.asset_id, setSelectedAgent, workspaceId]);

  const handleSearch = useMemo(
    () =>
      _.debounce((search) => {
        const filteredAgents = agents.filter((item) => {
          return item?.name?.toLowerCase()?.includes(search?.toLowerCase());
        });
        setAgentsToShow(filteredAgents);
      }, 200),
    [agents]
  );

  return (
    <div className={classes["initialize-container"]}>
      <Lottie
        animationData={agentLottie}
        loop={true}
        style={{
          height: "10rem",
          marginTop: "2rem",
        }}
      />

      <div className={classes["agents-header"]}>
        <h2 className={classes["agents-heading"]}>Select an Agent</h2>
        <p className={classes["agents-description"]}>
          Choose a pre-configured agent to initialize your agent. You can view
          the creation details for each agent below.
        </p>
      </div>

      <div className={classes["agents-container"]}>
        <TextField
          
          placeholder={"Search agents by name..."}
          onChange={(e) => {
            handleSearch(e?.target?.value);
          }}
          className="black"
          InputProps={{
            startAdornment: (
              <ODSIcon
                outeIconName="OUTESearchIcon"
                outeIconProps={{
                  sx: {
                    width: "1.25rem",
                    height: "1.25rem",
                  },
                }}
              />
            ),
          }}
        />

        <div className={classes["divider"]} />
        {loading ? (
          <AgentsListLoader />
        ) : (
          <AgentsList
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            agents={agentsToShow}
          />
        )}
      </div>
    </div>
  );
};
