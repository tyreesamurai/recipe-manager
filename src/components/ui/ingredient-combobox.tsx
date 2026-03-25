"use client";

import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Ingredient } from "@/lib/types";

interface IngredientComboboxProps {
  options: Ingredient[];
  value: string;
  onChange: (name: string) => void;
  onSelect?: (ingredient: Ingredient) => void;
  placeholder?: string;
}

export function IngredientCombobox({
  options,
  value,
  onChange,
  onSelect,
  placeholder = "Ingredient name",
}: IngredientComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (ingredient: Ingredient) => {
    onChange(ingredient.name);
    onSelect?.(ingredient);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open && e.target.value.length > 0) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search ingredients…" value={value} onValueChange={onChange} />
          <CommandList>
            <CommandEmpty className="py-2 px-3 text-sm text-muted-foreground">
              New ingredient — will be created
            </CommandEmpty>
            <CommandGroup>
              {options.map((ing) => (
                <CommandItem
                  key={ing.id ?? ing.name}
                  value={ing.name}
                  onSelect={() => handleSelect(ing)}
                >
                  {ing.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
