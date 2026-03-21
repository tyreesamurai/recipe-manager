"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { buildRecipeFilterQuery } from "@/lib/filters";
import { helpers } from "@/lib/helpers";
import type { RecipeFilters } from "@/lib/types";

const formSchema = z.object({
  name: z.string().optional(),
  maxTime: z.coerce.number().optional(),
  maxCalories: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
}) satisfies z.ZodType<RecipeFilters>;

export function FilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as unknown as Resolver, // TODO: fix this type error
    defaultValues: {
      name: searchParams.get("name") ?? "",
      maxTime: helpers.parseNumberOr(searchParams.get("maxTime"), 0),
      maxCalories: helpers.parseNumberOr(searchParams.get("maxCalories"), 0),
      tags: [],
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const qs = buildRecipeFilterQuery(data);
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Recipe Name</FieldLabel>
              <Input
                {...field}
                id="name"
                autoComplete="off"
                placeholder="e.g. pasta"
              />
            </Field>
          )}
        />

        <Controller
          name="maxTime"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="maxTime">Max Time (min)</FieldLabel>
              <Input
                {...field}
                id="maxTime"
                type="number"
                min={0}
                placeholder="e.g. 30"
              />
            </Field>
          )}
        />

        <Controller
          name="maxCalories"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="maxCalories">Max Calories</FieldLabel>
              <Input
                {...field}
                id="maxCalories"
                type="number"
                min={0}
                placeholder="e.g. 600"
              />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" className="flex-1">
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
