"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  TITLE_MAX_LENGTH,
  TRY_AGAIN_MESSAGE,
} from "@/features/requests/constants";
import { useCreateRequest } from "@/features/requests/hooks/use-create-request";
import { usePriorities } from "@/features/requests/hooks/use-priorities";
import { useTeams } from "@/features/requests/hooks/use-teams";
import type {
  CreateRequestField,
  CreateRequestValues,
} from "@/features/requests/server/actions";

type FieldErrorProps = { field: CreateRequestField; error?: string };

function FieldError({ field, error }: FieldErrorProps) {
  if (!error) return null;
  return (
    <p id={`${field}-error`} className="text-sm text-destructive">
      {error}
    </p>
  );
}

function readValues(form: HTMLFormElement): CreateRequestValues {
  const data = new FormData(form);
  const read = (name: CreateRequestField) => {
    const value = data.get(name);
    // A select with no option selected sends no value. It reads as "".
    return typeof value === "string" ? value : "";
  };
  return {
    title: read("title"),
    details: read("details"),
    team: read("team"),
    priority: read("priority"),
  };
}

export function CreateRequestForm() {
  const mutation = useCreateRequest();
  const teams = useTeams();
  const priorities = usePriorities();

  const result = mutation.data;
  const fieldErrors =
    result && !result.ok && "fieldErrors" in result ? result.fieldErrors : {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  // The message above the submit button: "Try again." when the server action
  // fails, or the API message for a 422 with no field errors.
  const formError = mutation.isError
    ? TRY_AGAIN_MESSAGE
    : result && !result.ok && !hasFieldErrors
      ? result.error
      : undefined;

  // The props that mark a field when it has an error.
  function errorProps(field: CreateRequestField) {
    const error = fieldErrors[field];
    return {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // The form does not reload the page, so the fields keep the user's input.
    event.preventDefault();
    const form = event.currentTarget;
    const saved = await mutation
      .mutateAsync(readValues(form))
      // The mutation state shows the error. Nothing more to do here.
      .catch(() => undefined);
    if (!saved?.ok) return;
    // Next.js keeps a page hidden, with its state, after the user goes to
    // another page. The New request link then shows the same form again, so
    // clear it after a success. The promise of mutateAsync resolves also when
    // the navigation hid the page first, and the mutation state then does not
    // update. reset() puts the mutation back to idle in both cases.
    form.reset();
    mutation.reset();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={TITLE_MAX_LENGTH}
          {...errorProps("title")}
        />
        <FieldError field="title" error={fieldErrors.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          name="details"
          required
          rows={5}
          {...errorProps("details")}
        />
        <FieldError field="details" error={fieldErrors.details} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="team">Team</Label>
          <NativeSelect
            id="team"
            name="team"
            required
            className="w-full"
            defaultValue=""
            {...errorProps("team")}
          >
            <NativeSelectOption value="" disabled>
              Select a team
            </NativeSelectOption>
            {teams.map((team) => (
              <NativeSelectOption key={team.value} value={team.value}>
                {team.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError field="team" error={fieldErrors.team} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="priority">Priority</Label>
          <NativeSelect
            id="priority"
            name="priority"
            className="w-full"
            defaultValue="medium"
            {...errorProps("priority")}
          >
            {priorities.map((priority) => (
              <NativeSelectOption key={priority.value} value={priority.value}>
                {priority.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError field="priority" error={fieldErrors.priority} />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3">
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Spinner aria-label="Saving the request" />}
          Submit request
        </Button>
      </div>
    </form>
  );
}
