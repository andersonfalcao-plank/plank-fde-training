import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const teams = [
  {
    title: "Operations",
    text: "Answers policy questions and files requests",
  },
  {
    title: "Finance",
    text: "Explains invoices and expense rules, and tracks what needs approval.",
  },
  {
    title: "Support",
    text: "Drafts replies from the knowledge base, with sources, for a person to send.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold tracking-tight">
          An Assistant for the teams that keep a company running
        </h2>
        <p className="text-muted-foreground">
          WorkBot answers questions, files requests and runs workflows for
          operations, finance and support teams, and for the customers they
          serve.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/settings">
              Open settings
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            {/* A plain link, because the health check is a JSON route, not a page. */}
            <a href="/api/health">Health check</a>
          </Button>
        </div>
      </section>
      <ul className="grid gap-4 sm:grid-cols-3">
        {teams.map(({ title, text }) => (
          <li key={title} className="flex">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{text}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
