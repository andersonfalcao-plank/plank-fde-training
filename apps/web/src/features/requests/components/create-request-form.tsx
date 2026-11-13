"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { usePriorities } from "@/features/requests/hooks/use-priorities";
import { useTeams } from "@/features/requests/hooks/use-teams";
import { TITLE_MAX_LENGTH } from "@/features/requests/constants";
import {
  type CreateRequestField,
  type CreateRequestState,
  createRequestAction,
} from "@/features/requests/server/actions";

const initialState: CreateRequestState = { fieldErrors: {}, values: {} };

type FieldErrorProps = { field: CreateRequestField; error?: string };

function FieldError({ field, error }: FieldErrorProps) {
  if (!error) return null;
  return (
    <p id={`${field}-error`} className="text-sm text-destructive">
      {error}
    </p>
  );
}

export function CreateRequestForm() {
  const [state, formAction, pending] = useActionState(
    createRequestAction,
    initialState,
  );
  const teams = useTeams();
  const priorities = usePriorities();

  // The props that mark a field when it has an error.
  function errorProps(field: CreateRequestField) {
    const error = state.fieldErrors[field];
    return {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    };
  }

  return (
    // React resets the form after the action. A select keeps only its first
    // defaultValue, so a new key remounts the fields with the values from the
    // action.
    <form
      key={JSON.stringify(state.values)}
      action={formAction}
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
          defaultValue={state.values.title}
          {...errorProps("title")}
        />
        <FieldError field="title" error={state.fieldErrors.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          name="details"
          required
          rows={5}
          defaultValue={state.values.details}
          {...errorProps("details")}
        />
        <FieldError field="details" error={state.fieldErrors.details} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="team">Team</Label>
          <NativeSelect
            id="team"
            name="team"
            required
            className="w-full"
            defaultValue={state.values.team ?? ""}
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
          <FieldError field="team" error={state.fieldErrors.team} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="priority">Priority</Label>
          <NativeSelect
            id="priority"
            name="priority"
            className="w-full"
            defaultValue={state.values.priority ?? "medium"}
            {...errorProps("priority")}
          >
            {priorities.map((priority) => (
              <NativeSelectOption key={priority.value} value={priority.value}>
                {priority.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError field="priority" error={state.fieldErrors.priority} />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          Submit request
        </Button>
      </div>
    </form>
  );
}
