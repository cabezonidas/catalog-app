import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "@tanstack/react-query";
import { TaskForm } from "../tasks_/$taskId/edit";

export const Route = createFileRoute("/tasks/new")({
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
      <h1>New</h1>
      <TaskForm
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);

          const created = await mutateAsync({
            isCompleted: formData.get("isCompleted") === "on",
            text: String(formData.get("text")),
          });

          navigate({ to: "/tasks/$taskId", params: { taskId: created._id } });
        }}
      />
    </div>
  );
}
