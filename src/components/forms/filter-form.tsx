"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from "@/components/ui/field";
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
    router.push(qs ? `/?{qs}` : "/");
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldLegend>Filter Section</FieldLegend>
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
                  placeholder="Nothing"
                />
              </Field>
            )}
          />

          <Controller
            name="maxTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="maxTime">Max Time</FieldLabel>
                <Input {...field} id="maxTime" type="number" />
              </Field>
            )}
          />

          <Controller
            name="maxCalories"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="maxCalories">Max Calories</FieldLabel>
                <Input {...field} id="maxCalories" type="number" />
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit">Apply</Button>
      </form>
      <Button type="submit" onClick={() => router.push("/")}>
        Reset
      </Button>
    </div>
  );
}
