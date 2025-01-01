import { createFileRoute, useRouter } from "@tanstack/react-router";
import { tasks } from "../../../../../convex/tasks";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../../convex/_generated/api";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_tasks/tasks_/$taskId/edit")({
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
      <h1>Edit</h1>
      <TaskForm
        initial={{ text, isCompleted }}
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);

          const created = await mutateAsync({
            id,
            isCompleted: formData.get("isCompleted") === "on",
            text: String(formData.get("text")),
          });

          await invalidate();

          navigate({ to: "/tasks/$taskId", params: { taskId: created._id } });
        }}
      />
    </div>
  );
}

export const TaskForm = ({
  initial,
  onSubmit,
}: {
  initial?: { text: string; isCompleted: boolean };
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}) => {
  return (
    <form {...{ onSubmit }}>
      <div style={{ display: "grid", width: 200, rowGap: 10 }}>
        <div>
          <label style={{ display: "block" }} htmlFor="text">
            Text
          </label>
          <input
            required
            id="text"
            name="text"
            defaultValue={initial?.text}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="isCompleted">Is Completed</label>
          <input
            type="checkbox"
            id="isCompleted"
            name="isCompleted"
            defaultChecked={initial?.isCompleted}
          />
        </div>
      </div>
      <button style={{ marginTop: 20 }}>Save</button>
    </form>
  );
};
