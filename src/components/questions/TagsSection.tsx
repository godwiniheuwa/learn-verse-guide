
import { Controller, useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, TrashIcon } from "lucide-react";
import { FormValues } from "./QuestionFormTypes";

interface TagsSectionProps {
  control: Control<FormValues>;
}

export const TagsSection = ({ control }: TagsSectionProps) => {
  const { fields: tagFields, append: appendTag, remove: removeTag } = 
    useFieldArray({ control, name: "tags" });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Tags</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendTag("")}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>
      <div className="space-y-3">
        {tagFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Controller
              name={`tags.${index}`}
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Enter tag"
                  {...field}
                  className="flex-1"
                />
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTag(index)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
