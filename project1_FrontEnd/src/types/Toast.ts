type ToastType = "success" | "error" | "warning" | "info";

export type ToastProps = {
  type: ToastType;
  message?: string;
  title: string;
  onClose?: () => void;
};
