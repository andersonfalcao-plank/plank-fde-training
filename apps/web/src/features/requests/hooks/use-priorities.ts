import {
  PRIORITY_LABELS,
  REQUEST_PRIORITIES,
  type RequestPriority,
} from "@/features/requests/constants";

export type PriorityOption = { value: RequestPriority; label: string };

const priorityOptions: PriorityOption[] = REQUEST_PRIORITIES.map(
  (priority) => ({ value: priority, label: PRIORITY_LABELS[priority] }),
);

// Returns the priorities that a user can select for a Request.
export function usePriorities(): PriorityOption[] {
  return priorityOptions;
}
