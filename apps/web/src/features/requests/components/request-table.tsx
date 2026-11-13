import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PRIORITY_LABELS,
  type RequestPriority,
  STATUS_LABELS,
} from "@/features/requests/constants";
import type { Request } from "@/features/requests/schemas";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

const priorityVariants: Record<RequestPriority, BadgeVariant> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

type RequestTableProps = {
  requests: Request[];
};

export function RequestTable({ requests }: RequestTableProps) {
  return (
    // On a small screen the table keeps a minimum width and scrolls inside its
    // container, so the badges do not overlap.
    <Table className="min-w-lg table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/2">Request</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request, index) => (
          // A Request has no id yet, so the key is its position in the list.
          <TableRow key={index}>
            {/* A long title is cut with "…". The title attribute shows all of it. */}
            <TableCell className="truncate font-medium" title={request.title}>
              {request.title}
            </TableCell>
            <TableCell className="truncate" title={request.team}>
              {request.team}
            </TableCell>
            <TableCell>
              <Badge variant={priorityVariants[request.priority]}>
                {PRIORITY_LABELS[request.priority]}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="default">{STATUS_LABELS[request.status]}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
