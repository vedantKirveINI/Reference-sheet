export type TRuntimeError = {
  errorType?: "infinite_loop" | "invalid_jump" | "generic";
  errorMessage?: string;
  technicalDetails?: {
    errorCode?: string;
    timestamp?: string;
    sessionId?: string;
    [key: string]: any;
  };
};

export type TRuntimeErrorScreenProps = {
  theme?: any;
  errorType?: TRuntimeError["errorType"];
  errorMessage?: TRuntimeError["errorMessage"];
  technicalDetails?: TRuntimeError["technicalDetails"];
  onRestart: () => void;
};
