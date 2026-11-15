"use client";

import { type FormEvent, useEffect, useRef } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);

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
  const succeeded = result?.ok === true;
  // The page changes after a success. Keep the button disabled until then.
  const busy = mutation.isPending || succeeded;

  // Next.js keeps a page hidden, with its state, after the user goes to
  // another page. The New request link then shows the same form again.
  // When the page hides after a success, clear the fields and the mutation,
  // so the form is empty and the button works on the next visit.
  const { reset: resetMutation } = mutation;
  useEffect(() => {
    if (!succeeded) return;
    const form = formRef.current;
    return () => {
      form?.reset();
      resetMutation();
    };
  }, [succeeded, resetMutation]);

  // The props that mark a field when it has an error.
  function errorProps(field: CreateRequestField) {
    const error = fieldErrors[field];
    return {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // The form does not reload the page, so the fields keep the user's input.
    event.preventDefault();
    mutation.mutate(readValues(event.currentTarget));
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
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
        <Button type="submit" disabled={busy}>
          {busy && <Spinner aria-label="Saving the request" />}
          Submit request
        </Button>
      </div>
    </form>
  );
}
