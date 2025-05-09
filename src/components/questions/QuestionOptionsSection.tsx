
// Fixing QuestionOptionsSection.tsx to handle proper types
import { Controller, useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, TrashIcon } from "lucide-react";
import { FormValues } from "./QuestionFormTypes";

interface QuestionOptionsSectionProps {
  control: Control<FormValues>;
}

export const QuestionOptionsSection = ({ control }: QuestionOptionsSectionProps) => {
  const { fields, append, remove } = 
    useFieldArray({ control, name: "options" });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Options</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: "" } as any)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Controller
              name={`options.${index}` as const}
              control={control}
              render={({ field }) => (
                <Input
                  placeholder={`Option ${index + 1}`}
                  {...field}
                  className="flex-1"
                />
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
