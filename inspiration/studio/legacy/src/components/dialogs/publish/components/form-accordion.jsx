// import ODSLabel from "oute-ds-label";
// import Icon from "oute-ds-icon";
import { ODSLabel, ODSIcon as Icon } from "@src/module/ods";
import { motion, AnimatePresence } from "framer-motion";
import classes from "./form-accordion.module.css";

const FormAccordion = ({
  title,
  description,
  children,
  isOpen,
  onToggle,
  id,
  dataTestId,
}) => {
  const handleToggle = () => {
    onToggle(id);
  };

  const testIdPrefix = `accordion-${id}`;

  return (
    <div
      className={`${classes.accordionContainer} ${
        !description ? classes.accordionContainerWithDescription : ""
      }`}
      data-testid={dataTestId ? `${dataTestId}-container` : ""}
    >
      <div
        className={classes.accordionHeader}
        onClick={handleToggle}
        data-testid={dataTestId ? `${dataTestId}-header` : ""}
      >
        <div className={classes.titleSection}>
          <ODSLabel
            variant="h6"
            className={classes.title}
            data-testid={`${testIdPrefix}-title`}
            children={title}
          />
          {description && (
            <ODSLabel
              variant="body1"
              className={classes.description}
              data-testid={`${testIdPrefix}-description`}
              children={description}
              sx={{ color: "#607D8B" }}
            />
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Icon
            outeIconName={isOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"}
            outeIconProps={{
              "data-testid": dataTestId ? `${dataTestId}-icon` : "",
              sx: { color: "#607D8B", height: "2rem", width: "2rem" },
            }}
          />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={classes.accordionContent}
            data-testid={dataTestId ? `${dataTestId}-content` : ""}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              height: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2, ease: "easeInOut" },
            }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormAccordion;
