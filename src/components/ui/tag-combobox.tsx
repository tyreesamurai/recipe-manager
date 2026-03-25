"use client";

import { Check, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface TagComboboxProps {
  options: Array<{ label: string; value: string }>;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disableCreate?: boolean;
  singleSelect?: boolean;
}

export function TagCombobox({
  options,
  value,
  onChange,
  placeholder = "Add tags…",
  disableCreate = false,
  singleSelect = false,
}: TagComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const toggle = (tag: string) => {
    if (singleSelect) {
      onChange(value[0] === tag ? [] : [tag]);
      setOpen(false);
      return;
    }
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  const createNew = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange(singleSelect ? [trimmed] : [...value, trimmed]);
    setInputValue("");
    if (singleSelect) setOpen(false);
  };

  const exactMatch = options.some(
    (o) => o.value.toLowerCase() === inputValue.toLowerCase(),
  );
  const showCreate = !disableCreate && inputValue.trim().length > 0 && !exactMatch;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="h-auto min-h-9 w-full justify-start gap-1 flex-wrap px-3 py-1.5 font-normal"
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs gap-1 pr-1"
              >
                {tag}
                <span
                  role="button"
                  aria-label={`Remove ${tag}`}
                  className="rounded-sm hover:bg-foreground/20 p-0.5"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggle(tag);
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput
            placeholder={disableCreate ? "Search…" : "Search or create…"}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {showCreate ? null : "No tags found."}
            </CommandEmpty>
            <CommandGroup>
              {showCreate && (
                <CommandItem
                  value={`__create__${inputValue}`}
                  onSelect={createNew}
                >
                  Add &quot;{inputValue}&quot;
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggle(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
