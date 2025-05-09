
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteQuestion = (canDelete: boolean = true, subjectId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const deleteQuestion = async (id: string): Promise<void> => {
    if (!canDelete) {
      throw new Error("You don't have permission to delete questions");
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting question ${id}`, error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      if (subjectId) {
        queryClient.invalidateQueries({ queryKey: ['questions', subjectId] });
      }
      toast({
        title: "Question deleted",
        description: "Your question has been deleted."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete question",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
