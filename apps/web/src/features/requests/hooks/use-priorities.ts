import {
  type RequestPriority,
  RequestPrioritySchema,
} from "@/features/requests/schemas";

export type PriorityOption = { value: RequestPriority; label: string };

const labels: Record<RequestPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const priorityOptions: PriorityOption[] = RequestPrioritySchema.options.map(
  (priority) => ({ value: priority, label: labels[priority] }),
);

// Returns the priorities that a user can select for a Request.
export function usePriorities(): PriorityOption[] {
  return priorityOptions;
}
