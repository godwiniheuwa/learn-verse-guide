
import { Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValues } from "./QuestionFormTypes";

interface TheoryAnswerSectionProps {
  control: Control<FormValues>;
}

export const TheoryAnswerSection = ({ control }: TheoryAnswerSectionProps) => {
  return (
    <FormField
      control={control}
      name="correct_answer"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sample Answer</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter a sample answer"
              className="min-h-[100px]"
              {...field}
              value={field.value as string || ""}
            />
          </FormControl>
          <FormDescription>
            Provide a sample answer for grading reference
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
