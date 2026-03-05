import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import classes from "./index.module.css";
// import { ODSTextField } from "@src/module/ods";
// import { ODSLabel } from "@src/module/ods";
import { ODSTextField, ODSLabel } from "@src/module/ods";
import FooterOauth from "./FooterOauth";
import AuthorizationForm from "../AuthorizationForm";
import { getFormID, shouldRenderDialog } from "./utils";
import FooterForm from "./FooterForm";
import ConnectionInfoDisplay from "./ConnectionInfoDisplay";
import { removeTagsFromString } from "../../../../../../../../../../module/constants";
import { getPostHookMeta } from "../../utils";
import { isEmpty } from "lodash";
// import { serverConfig } from "@src/module/ods";
import { serverConfig } from "@src/module/ods";
import { toast } from "sonner";
const generateConnectionName = (baseName) => {
  const now = new Date();
  const timestamp = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${baseName} - ${timestamp}`;
};

const AddConnection = ({
  authorization,
  parentId,
  projectId,
  workspaceId,
  setShowAddConnection,
  onNewConnectionCreation,
  integrationName = "",
}) => {
  const isFormBased = shouldRenderDialog(authorization?.authorization_type);
  const authFormRef = useRef();
  const hasUserEditedName = useRef(false);

  const getBaseName = () =>
    integrationName || authorization?.authorization?.name || "Connection";

  const [name, setName] = useState(() => generateConnectionName(getBaseName()));
  const [showAuthForm, setShowAuthForm] = useState(false);

  useEffect(() => {
    if (integrationName && !hasUserEditedName.current) {
      setName(generateConnectionName(integrationName));
    }
  }, [integrationName]);

  const handleNameChange = (e) => {
    hasUserEditedName.current = true;
    setName(e.target.value);
  };

  const onAddNewConnectionClickHandler = useCallback(async () => {
    authFormRef.current && (await authFormRef?.current?.onSubmit());
  }, [authFormRef]);

  const onAdd = useCallback(
    async ({ state, flow }) => {
      if (!state || !flow) return;
      const questionIDS = Object.keys(state);
      const nodes = flow?.flow;

      const configData = {};

      questionIDS.forEach((id) => {
        const configDataKey = removeTagsFromString(nodes[id]?.config?.question);
        configData[configDataKey] = state[id]?.response;
      });

      const postHookMeta = await getPostHookMeta(authorization, configData);
      if (!isEmpty(postHookMeta)) {
        configData["post_hook_meta"] = postHookMeta;
      }

      const body = {
        name: name,
        authorization_id: authorization?.authorization_id,
        request_id: new Date().getTime(),
        parent_id: projectId,
        workspace_id: workspaceId,
        configs: configData,
        state: "ACTIVE",
      };

      const postOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: window.accessToken,
        },
        body: JSON.stringify(body),
      };

      const res = await fetch(
        `${serverConfig.OUTE_SERVER}/service/v0/authorized/data/save`,
        postOptions
      );

      if (!res.ok) {
        toast.error("Connection Error", {
          description: "Something went wrong",
        });
      } else {
        await onNewConnectionCreation();
        setShowAddConnection(false);
      }
    },
    [
      authorization,
      name,
      onNewConnectionCreation,
      projectId,
      setShowAddConnection,
      workspaceId,
    ]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.25,
        ease: "easeIn",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.25,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.div
      className={classes["container"]}
      data-testid="add-connection-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={classes["input-container"]}
        data-testid="add-connection-input-container"
        variants={itemVariants}
      >
        <ODSLabel data-testid="connection-name-label" variant="sub-heading-1">
          Connection Name
        </ODSLabel>
        <ODSTextField
          data-testid="connection-name-input"
          placeholder="Enter Connection name"
          fullWidth
          className="black"
          autoFocus
          value={name}
          onChange={handleNameChange}
        />
      </motion.div>
      <div className={classes["content-scrollable"]}>
        <AnimatePresence mode="wait" initial={false}>
          {isFormBased ? (
            <motion.div
              key="authorization-form"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: "100%" }}
            >
              <AuthorizationForm
                authorization={authorization}
                formId={getFormID(authorization)}
                parentId={parentId}
                projectId={projectId}
                workspaceId={workspaceId}
                ref={authFormRef}
                onSubmit={onAdd}
              />
            </motion.div>
          ) : (
            <motion.div
              key="connection-info-display"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: "100%" }}
            >
              <ConnectionInfoDisplay authorization={authorization} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {isFormBased ? (
          <motion.div
            key="footer-form"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ flexShrink: 0, width: "100%" }}
          >
            <FooterForm
              setShowAddConnection={setShowAddConnection}
              name={name}
              onAddNewConnectionClickHandler={onAddNewConnectionClickHandler}
            />
          </motion.div>
        ) : (
          <motion.div
            key="footer-oauth"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ flexShrink: 0, width: "100%" }}
          >
            <FooterOauth
              setShowAddConnection={setShowAddConnection}
              authorization={authorization}
              name={name}
              parentId={parentId}
              projectId={projectId}
              workspaceId={workspaceId}
              onConnectionAddSuccessfully={async () => {
                await onNewConnectionCreation();
                setShowAddConnection(false);
              }}
              setShowAuthForm={setShowAuthForm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddConnection;
