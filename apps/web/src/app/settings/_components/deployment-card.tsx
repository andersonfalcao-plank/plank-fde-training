import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { config } from "@/lib/config";

export async function DeploymentCard() {
  // Read the values at request time. A build promoted to another environment must not show old values.
  await connection();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Deployment
          <Badge variant="secondary">{config.environment}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardDescription>
          The environment this instance runs in and the commit it serves.
        </CardDescription>
        <dl className="flex gap-2 text-sm">
          <dt className="font-medium">Commit</dt>
          <dd className="font-mono text-muted-foreground">{config.commit}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
