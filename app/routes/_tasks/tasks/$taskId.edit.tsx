import { createFileRoute, useRouter } from "@tanstack/react-router";
import { tasks } from "../../../../convex/tasks";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { TaskForm } from "../-ui/taskForm";

export const Route = createFileRoute("/_tasks/tasks/$taskId/edit")({
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(tasks.get(params.taskId));
  },
  component: RouteComponent,
});

function useEditTaskMutation() {
  const mutationFn = useConvexMutation(api.tasks.setTask);
  return useMutation({ mutationFn });
}

function RouteComponent() {
  const { navigate, invalidate } = useRouter();
  const { mutateAsync } = useEditTaskMutation();
  const id = Route.useParams().taskId;
  const {
    data: { text, isCompleted },
  } = useSuspenseQuery(tasks.get(id));
  return (
    <div>
      <h2>Edit</h2>
      <TaskForm
        initial={{ text, isCompleted }}
        handleSubmit={async (values) => {
          const created = await mutateAsync({
            id,
            ...values,
          });
          await invalidate();
          navigate({ to: "/tasks/$taskId", params: { taskId: created._id } });
        }}
      />
    </div>
  );
}
