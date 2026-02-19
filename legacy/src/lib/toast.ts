import { toast } from "sonner";

interface AlertOptions {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export function showAlert({ type, message, duration = 3000 }: AlertOptions) {
  switch (type) {
    case "success":
      toast.success(message, { duration });
      break;
    case "error":
      toast.error(message, { duration });
      break;
    case "warning":
      toast.warning(message, { duration });
      break;
    case "info":
      toast.info(message, { duration });
      break;
    default:
      toast(message, { duration });
  }
}
