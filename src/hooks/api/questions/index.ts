
import { useFetchQuestions } from './use-fetch-questions';
import { useCreateQuestion } from './use-create-question';
import { useUpdateQuestion } from './use-update-question';
import { useDeleteQuestion } from './use-delete-question';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/middleware/role-guard';
import { NewQuestion, UpdateQuestionData } from './types';

export * from './types';

export const useQuestions = (subjectId?: string) => {
  const { user } = useAuth();

  const canView = hasPermission(user, 'questions', 'view');
  const canCreate = hasPermission(user, 'questions', 'create');
  const canUpdate = hasPermission(user, 'questions', 'update');
  const canDelete = hasPermission(user, 'questions', 'delete');

  // Get the hooks from useFetchQuestions
  const { useAllQuestions, useQuestion } = useFetchQuestions(subjectId, canView);
  const createQuestionMutation = useCreateQuestion(canCreate);
  const updateQuestionMutation = useUpdateQuestion(canUpdate);
  const deleteQuestionMutation = useDeleteQuestion(canDelete, subjectId);

  const useCreateQuestionWithUser = () => {
    return {
      ...createQuestionMutation,
      mutateAsync: async (question: NewQuestion) => {
        if (!user) throw new Error("You must be logged in to create questions");
        return createQuestionMutation.mutateAsync({
          ...question,
          created_by: user.id
        });
      }
    };
  };

  return {
    // Permissions
    canView,
    canCreate,
    canUpdate,
    canDelete,
    
    // Queries
    useAllQuestions,
    useQuestion,
    
    // Mutations
    useCreateQuestion: useCreateQuestionWithUser,
    useUpdateQuestion: () => updateQuestionMutation,
    useDeleteQuestion: () => deleteQuestionMutation
  };
};
