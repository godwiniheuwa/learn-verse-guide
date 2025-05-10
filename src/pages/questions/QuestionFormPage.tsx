
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestions } from "@/hooks/api/use-questions";
import { useSubjects } from "@/hooks/api/use-subjects";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { QuestionDetailsSection } from "@/components/questions/QuestionDetailsSection";
import { QuestionOptionsSection } from "@/components/questions/QuestionOptionsSection";
import { TheoryAnswerSection } from "@/components/questions/TheoryAnswerSection";
import { TagsSection } from "@/components/questions/TagsSection";
import { questionSchema, FormValues, QuestionFormData } from "@/components/questions/QuestionFormTypes";

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
      type: "MCQ",
      difficulty: "medium",
      subject_id: null,
      options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
      correct_answer: "",
      tags: [],
      points: 1,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Convert form values to API format
      const apiData: QuestionFormData = {
        text: data.text,
        type: data.type,
        subject_id: data.subject_id,
        difficulty: data.difficulty,
        // Extract value from options objects
        options: data.options.filter(opt => opt.value.trim() !== "").map(opt => opt.value),
        correct_answer: data.correct_answer,
        // Extract value from tags objects
        tags: data.tags.filter(tag => tag.value.trim() !== "").map(tag => tag.value),
        points: data.points || 1,
      };

      if (isEditing && id) {
        await updateQuestion.mutateAsync({
          id,
          ...apiData,
        });
        toast({
          title: "Question updated",
          description: "Your question has been successfully updated.",
        });
      } else {
        await createQuestion.mutateAsync(apiData);
        toast({
          title: "Question created",
          description: "Your question has been successfully created.",
        });
      }

      navigate("/questions");
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your question.",
        variant: "destructive",
      });
    }
  };

  // Set form values when editing existing question
  useEffect(() => {
    if (isEditing && question) {
      // Convert API data format to form format
      form.reset({
        text: question.text,
        type: question.type,
        subject_id: question.subject_id,
        difficulty: question.difficulty,
        // Convert string array to array of objects with value property
        options: question.options ? 
          question.options.map(option => ({ value: option })) : 
          [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
        correct_answer: question.correct_answer as string,
        // Convert string array to array of objects with value property
        tags: question.tags ? 
          question.tags.map(tag => ({ value: tag })) : 
          [],
        points: question.points || 1,
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
              {/* Question Details Section */}
              <QuestionDetailsSection control={form.control} subjects={subjects} />

              {/* Options for MCQ */}
              {questionType === "MCQ" && (
                <QuestionOptionsSection control={form.control} />
              )}

              {/* Sample answer for Theory */}
              {questionType === "theory" && (
                <TheoryAnswerSection control={form.control} />
              )}

              {/* Tags */}
              <TagsSection control={form.control} />

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
