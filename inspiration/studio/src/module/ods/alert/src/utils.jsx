import { toast } from "@/hooks/use-toast";
import AlertWrapper from "./AlertWrapper.jsx";

export const showAlert = ({
  message,
  type,
  autoHideDuration = 3000,
  showProgress = true,
  progressProps = {},
  ...props
}) => {
  toast({
    variant: type || "default",
    duration: autoHideDuration,
    ...props,
    children: (
      <AlertWrapper
        progressProps={progressProps}
        autoHideDuration={autoHideDuration}
        type={type}
        showProgress={showProgress}
      >
        {message}
      </AlertWrapper>
    ),
  });
};
