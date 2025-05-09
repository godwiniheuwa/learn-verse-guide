import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestions } from "@/hooks/api/use-questions";
import { useSubjects } from "@/hooks/api/use-subjects";
import { Question, QuestionType, QuestionDifficulty } from "@/types/exam";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Form schema
const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MCQ", "theory"]),
  subject_id: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  options: z.array(z.string()).optional(),
  correct_answer: z.union([z.string(), z.array(z.string())]).optional(),
  media_urls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof questionSchema>;

const QuestionFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const { useQuestion, useCreateQuestion, useUpdateQuestion } = useQuestions();
  const { data: question, isLoading: isLoadingQuestion } = useQuestion(id!);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const { useAllSubjects } = useSubjects();
  const { data: subjects, isLoading: isLoadingSubjects } = useAllSubjects();

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      type: "MCQ" as QuestionType,
      difficulty: "medium" as QuestionDifficulty,
      subject_id: null,
      options: ["", "", "", ""],
      correct_answer: "",
      media_urls: [],
      tags: [],
    },
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = 
    useFieldArray({ control: form.control, name: "options" });
  
  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = 
    useFieldArray({ control: form.control, name: "media_urls" });
  
  const { fields: tagFields, append: appendTag, remove: removeTag } = 
    useFieldArray({ control: form.control, name: "tags" });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Clean up empty fields
      const cleanData = {
        ...data,
        options: data.options?.filter(o => o.trim() !== ""),
        media_urls: data.media_urls?.filter(m => m.trim() !== ""),
        tags: data.tags?.filter(t => t.trim() !== ""),
      };

      if (isEditing && id) {
        await updateQuestion.mutateAsync({
          id,
          ...cleanData,
        });
      } else {
        await createQuestion.mutateAsync(cleanData as any);
      }

      navigate("/questions");
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  // Set form values when editing existing question
  useEffect(() => {
    if (isEditing && question) {
      form.reset({
        text: question.text,
        type: question.type,
        subject_id: question.subject_id,
        difficulty: question.difficulty,
        options: question.options || ["", "", "", ""],
        correct_answer: question.correct_answer,
        media_urls: question.media_urls || [],
        tags: question.tags || [],
      });
    }
  }, [isEditing, question, form]);

  // Handle question type change
  const questionType = form.watch("type");

  if (isLoadingQuestion && isEditing) {
    return <div className="container mx-auto py-8">Loading question...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Question" : "Create New Question"}
        </h1>
        <Link to="/questions">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Question" : "Create New Question"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the question details below"
              : "Fill in the form to create a new question"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question text"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MCQ">Multiple Choice</SelectItem>
                          <SelectItem value="theory">Theory</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Options for MCQ */}
              {questionType === "MCQ" && (
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
                            control={form.control}
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
                    control={form.control}
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
                            {form.watch("options")?.map((option, index) => (
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
              )}

              {/* Sample answer for Theory */}
              {questionType === "theory" && (
                <FormField
                  control={form.control}
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
              )}

              {/* Media URLs */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Media URLs</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendMedia("")}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Media
                  </Button>
                </div>
                <div className="space-y-3">
                  {mediaFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Controller
                        name={`media_urls.${index}`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            placeholder="Enter media URL"
                            {...field}
                            className="flex-1"
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedia(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
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
                        control={form.control}
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

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={createQuestion.isPending || updateQuestion.isPending}>
                  {isEditing ? "Update Question" : "Create Question"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionFormPage;
