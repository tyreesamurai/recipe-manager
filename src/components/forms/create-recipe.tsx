"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { IngredientCombobox } from "@/components/ui/ingredient-combobox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagCombobox } from "@/components/ui/tag-combobox";
import { Textarea } from "@/components/ui/textarea";
import {
  type Ingredient,
  type Recipe,
  recipeSchema,
  type Tag,
} from "@/lib/types";

const formSchema = recipeSchema.extend({
  description: z.string().optional(),
  instructions: z.array(z.object({ text: z.string() })),
  inputUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  servings: z.number().int().nonnegative().optional(),
  nutrition: z
    .object({
      calories: z.number().nonnegative(),
      protein: z.number().nonnegative().optional(),
      fats: z.number().nonnegative().optional(),
      carbs: z.number().nonnegative().optional(),
    })
    .optional(),
  cookingTimes: z
    .object({
      total: z.number().nonnegative(),
      prep: z.number().nonnegative().optional(),
      cook: z.number().nonnegative().optional(),
      additional: z.number().nonnegative().optional(),
      rest: z.number().nonnegative().optional(),
      cool: z.number().nonnegative().optional(),
    })
    .optional(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().nonnegative().optional(),
      unit: z.string().optional(),
    }),
  ),
});

export function CreateRecipeForm(props: {
  recipe?: Recipe;
  ingredients?: Ingredient[];
  tags?: Tag[];
}) {
  const router = useRouter();
  const [allTags, setAllTags] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) =>
        setAllTags(
          (d.tags ?? []).map((t: Tag) => ({ label: t.name, value: t.name })),
        ),
      );
    fetch("/api/ingredients")
      .then((r) => r.json())
      .then((d) => setAllIngredients(d.ingredients ?? []));
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.recipe?.name ?? "",
      description: props.recipe?.description ?? "",
      instructions: props.recipe?.instructions?.map((instruction) => ({
        text: instruction,
      })) ?? [{ text: "" }],
      tags: props.tags?.map((t) => t.name) ?? [],
      servings: props.recipe?.servings ?? undefined,
      nutrition: props.recipe?.nutrition ?? {
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0,
      },
      cookingTimes: props.recipe?.cookingTimes ?? {
        prep: 0,
        cook: 0,
        total: 0,
        additional: 0,
        rest: 0,
        cool: 0,
      },
      imageUrl: props.recipe?.imageUrl ?? "",
      inputUrl: props.recipe?.inputUrl ?? "",
      ingredients: props.ingredients?.map((i) => ({
        name: i.name,
        quantity: i.quantity ?? 0,
        unit: i.unit ?? "",
      })) ?? [{ name: "", quantity: 0, unit: "" }],
    },
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const instructions = (data.instructions ?? [])
      .map((i) => i.text.trim())
      .filter(Boolean);

    const ingredients = (data.ingredients ?? [])
      .map((i) => ({
        name: i.name.trim(),
        ...(i.quantity && { quantity: i.quantity }),
        ...(i.unit?.trim() && { unit: i.unit.trim() }),
      }))
      .filter((i) => i.name.length > 0);

    const tags = (data.tags ?? [])
      .map((name) => ({ name: name.trim() }))
      .filter((t) => t.name.length > 0);

    const recipePayload: Recipe = {
      name: data.name.trim(),
      ...(data.description?.trim() && { description: data.description.trim() }),
      ...(instructions.length > 0 && { instructions }),
      ...(data.nutrition?.calories ? { nutrition: data.nutrition } : {}),
      ...(data.cookingTimes?.total ? { cookingTimes: data.cookingTimes } : {}),
      ...(data.inputUrl?.trim() && { inputUrl: data.inputUrl.trim() }),
      ...(data.imageUrl?.trim() && { imageUrl: data.imageUrl.trim() }),
      ...(data.servings != null && { servings: data.servings }),
    };

    const payload = {
      recipe: recipePayload,
      ...(ingredients.length > 0 && { ingredients }),
      ...(tags.length > 0 && { tags }),
    };

    fetch("/api/recipes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Failed to save recipe", {
            description: data.error.message,
          });
        } else {
          toast.success(props.recipe ? "Recipe updated!" : "Recipe created!");
          router.push(`/${data.result.recipeName.replaceAll(" ", "-")}`);
        }
      })
      .catch(() => toast.error("Failed to save recipe"));
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Tabs defaultValue="basics">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Basic Info</h2>
            <p className="text-sm text-muted-foreground">
              Give your recipe a name and a short description.
            </p>
          </div>

          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    Recipe Name{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="e.g. Spaghetti Carbonara"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="A brief description of the recipe…"
                    className="resize-none"
                    rows={4}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    options={allTags}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add tags…"
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="instructions" className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Instructions</h2>
            <p className="text-sm text-muted-foreground">
              Add each step of your recipe in order.
            </p>
          </div>

          <div className="space-y-3">
            {instructionFields.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-start">
                <span className="mt-8 shrink-0 w-7 h-7 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </span>

                <Controller
                  control={form.control}
                  name={`instructions.${index}.text`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                      <FieldLabel htmlFor={`instructions.${index}.text`}>
                        Step {index + 1}
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={`instructions.${index}.text`}
                        placeholder="Describe this step…"
                        className="resize-none"
                        rows={2}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8 text-muted-foreground hover:text-destructive"
                  disabled={index === 0}
                  onClick={() => removeInstruction(index)}
                  aria-label={`Remove step ${index + 1}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => appendInstruction({ text: "" })}
            >
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Ingredients</h2>
            <p className="text-sm text-muted-foreground">
              List every ingredient with its quantity and unit.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_100px_100px_36px] gap-2 px-1">
              <span className="text-xs font-medium text-muted-foreground">
                Ingredient
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Qty
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Unit
              </span>
              <span />
            </div>

            {ingredientFields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_100px_100px_36px] gap-2 items-start"
              >
                <Controller
                  name={`ingredients.${index}.name`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="sr-only"
                        htmlFor={`ingredients.${index}.name`}
                      >
                        Ingredient name
                      </FieldLabel>
                      <IngredientCombobox
                        options={allIngredients}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="e.g. flour"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name={`ingredients.${index}.quantity`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="sr-only"
                        htmlFor={`ingredients.${index}.quantity`}
                      >
                        Quantity
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`ingredients.${index}.quantity`}
                        type="number"
                        min={0}
                        placeholder="0"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.valueAsNumber,
                          )
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name={`ingredients.${index}.unit`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="sr-only"
                        htmlFor={`ingredients.${index}.unit`}
                      >
                        Unit
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`ingredients.${index}.unit`}
                        placeholder="g, cup…"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 text-muted-foreground hover:text-destructive"
                  disabled={index === 0}
                  onClick={() => removeIngredient(index)}
                  aria-label={`Remove ingredient ${index + 1}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                appendIngredient({ name: "", quantity: 0, unit: "" })
              }
            >
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="details" className="pt-6 space-y-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Nutrition</h2>
              <p className="text-sm text-muted-foreground">
                Optional — per serving values.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(
                [
                  { name: "nutrition.calories", label: "Calories" },
                  { name: "nutrition.protein", label: "Protein (g)" },
                  { name: "nutrition.fats", label: "Fats (g)" },
                  { name: "nutrition.carbs", label: "Carbs (g)" },
                ] as const
              ).map(({ name, label }) => (
                <Controller
                  key={name}
                  name={name}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={name}>{label}</FieldLabel>
                      <Input
                        {...field}
                        id={name}
                        type="number"
                        min={0}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.valueAsNumber,
                          )
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Cooking Times</h2>
              <p className="text-sm text-muted-foreground">
                All values in minutes.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(
                [
                  { name: "cookingTimes.prep", label: "Prep" },
                  { name: "cookingTimes.cook", label: "Cook" },
                  { name: "cookingTimes.total", label: "Total" },
                ] as const
              ).map(({ name, label }) => (
                <Controller
                  key={name}
                  name={name}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={name}>{label}</FieldLabel>
                      <Input
                        {...field}
                        id={name}
                        type="number"
                        min={0}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.valueAsNumber,
                          )
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Servings</h2>
              <p className="text-sm text-muted-foreground">
                Optional — how many people this recipe serves.
              </p>
            </div>
            <Controller
              name="servings"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="max-w-35">
                  <FieldLabel htmlFor="servings">Servings</FieldLabel>
                  <Input
                    {...field}
                    id="servings"
                    type="number"
                    min={1}
                    placeholder="e.g. 4"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : e.target.valueAsNumber,
                      )
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Sources</h2>
              <p className="text-sm text-muted-foreground">
                Optional — link to the original recipe or an image.
              </p>
            </div>

            <FieldGroup>
              <Controller
                name="imageUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="imageUrl">Image URL</FieldLabel>
                    <Input {...field} id="imageUrl" placeholder="https://…" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="inputUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="inputUrl">Source URL</FieldLabel>
                    <Input {...field} id="inputUrl" placeholder="https://…" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-2 border-t">
        <Button type="submit" className="w-full sm:w-auto">
          Save Recipe
        </Button>
      </div>
    </form>
  );
}
