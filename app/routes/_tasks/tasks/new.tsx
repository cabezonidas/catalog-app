import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../convex/_generated/api";
import { useMutation } from "@tanstack/react-query";
import { TaskForm } from "../-ui/taskForm";

export const Route = createFileRoute("/_tasks/tasks/new")({
  component: RouteComponent,
});

function useCreateTaskMutation() {
  const mutationFn = useConvexMutation(api.tasks.setTask);
  return useMutation({ mutationFn });
}

function RouteComponent() {
  const { navigate } = useRouter();
  const { mutateAsync } = useCreateTaskMutation();

  return (
    <div>
      <h2>Add</h2>
      <TaskForm
        handleSubmit={async (values) => {
          const created = await mutateAsync(values);
          navigate({ to: "/tasks/$taskId", params: { taskId: created._id } });
        }}
      />
    </div>
  );
}
