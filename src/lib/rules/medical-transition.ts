export type MedicalTransitionEventType =
  | "referred"
  | "case_opened"
  | "medical_evaluation"
  | "found_fit"
  | "found_unfit"
  | "separation_or_retirement_ordered"
  | "case_closed";

export type DesIdesStatus =
  | "referred"
  | "in_process"
  | "found_fit"
  | "found_unfit"
  | "complete";

export const statusByEvent: Record<MedicalTransitionEventType, DesIdesStatus> = {
  referred: "referred",
  case_opened: "in_process",
  medical_evaluation: "in_process",
  found_fit: "found_fit",
  found_unfit: "found_unfit",
  separation_or_retirement_ordered: "complete",
  case_closed: "complete",
};

export function getStatusForEvent(eventType: MedicalTransitionEventType): DesIdesStatus {
  return statusByEvent[eventType];
}
