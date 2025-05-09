
import { Controller, useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";
import { FormValues } from "./QuestionFormTypes";

interface QuestionOptionsSectionProps {
  control: Control<FormValues>;
}

export const QuestionOptionsSection = ({ control }: QuestionOptionsSectionProps) => {
  const { fields: optionFields, append: appendOption, remove: removeOption } = 
    useFieldArray({ control, name: "options" });

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Options</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendOption("")}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
        <div className="space-y-3">
          {optionFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Controller
                name={`options.${index}`}
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder={`Option ${index + 1}`}
                    {...field}
                    className="flex-1"
                  />
                )}
              />
              {index > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <FormField
        control={control}
        name="correct_answer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correct Answer</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value as string}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {control._formValues.options?.map((option, index) => (
                  option.trim() !== "" && (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Select the correct answer from the options
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
