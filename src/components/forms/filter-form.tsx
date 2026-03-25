"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TagCombobox } from "@/components/ui/tag-combobox";
import { buildRecipeFilterQuery } from "@/lib/filters";
import { helpers } from "@/lib/helpers";
import type { Ingredient, Recipe, RecipeFilters, Tag } from "@/lib/types";

const formSchema = z.object({
  name: z.string().optional(),
  maxTime: z.coerce.number().optional(),
  maxCalories: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
}) satisfies z.ZodType<RecipeFilters>;

export function FilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tagOptions, setTagOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [ingredientOptions, setIngredientOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [nameOptions, setNameOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) =>
        setTagOptions(
          (d.tags ?? []).map((t: Tag) => ({ label: t.name, value: t.name })),
        ),
      );
    fetch("/api/ingredients")
      .then((r) => r.json())
      .then((d) =>
        setIngredientOptions(
          (d.ingredients ?? []).map((i: Ingredient) => ({
            label: i.name,
            value: i.name,
          })),
        ),
      );
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((d) =>
        setNameOptions(
          (d.recipes ?? []).map((r: Recipe) => ({
            label: r.name,
            value: r.name,
          })),
        ),
      );
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as unknown as Resolver, // TODO: fix this type error
    defaultValues: {
      name: searchParams.get("name") ?? "",
      maxTime: helpers.parseNumberOr(searchParams.get("maxTime"), 0),
      maxCalories: helpers.parseNumberOr(searchParams.get("maxCalories"), 0),
      tags: searchParams.getAll("tags"),
      ingredients: searchParams.getAll("ingredients"),
    },
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const qs = buildRecipeFilterQuery(data as RecipeFilters);
        router.push(qs ? `/?${qs}` : "/");
      }, 400);
    });
    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [form, router]);

  return (
    <div className="space-y-1">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Recipe Name</FieldLabel>
              <TagCombobox
                options={nameOptions}
                value={field.value ? [field.value] : []}
                onChange={(vals) => field.onChange(vals[vals.length - 1] ?? "")}
                placeholder="Search by name…"
                disableCreate
                singleSelect
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
                value={field.value || ""}
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
                value={field.value || ""}
              />
            </Field>
          )}
        />

        <Controller
          name="tags"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Tags</FieldLabel>
              <TagCombobox
                options={tagOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Filter by tag…"
              />
            </Field>
          )}
        />

        <Controller
          name="ingredients"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Ingredients</FieldLabel>
              <TagCombobox
                options={ingredientOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Filter by ingredient…"
                disableCreate
              />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            form.reset({
              name: "",
              maxTime: 0,
              maxCalories: 0,
              tags: [],
              ingredients: [],
            });
            router.push("/");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
