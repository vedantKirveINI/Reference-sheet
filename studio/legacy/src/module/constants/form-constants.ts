const SUBMISSION_STATES = {
  IDLE: "idle",
  SUBMITTING: "submitting",
  RETRYING: "retrying",
  SUBMITTED: "submitted",
};

type SubmissionState = keyof typeof SUBMISSION_STATES;

export { SUBMISSION_STATES, type SubmissionState };
