import { toast } from "sonner";

interface ShowAlertOptions {
  type: "error" | "success" | "warning" | "info";
  message: string;
}

export function showAlert({ type, message }: ShowAlertOptions) {
  switch (type) {
    case "error":
      toast.error(message);
      break;
    case "success":
      toast.success(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    case "info":
      toast.info(message);
      break;
    default:
      toast(message);
  }
}
