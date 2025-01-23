import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { tasks } from "../../../../convex/tasks";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_tasks/tasks/$taskId/edit")({
  loader: async ({ params, context: { queryClient } }) => {
    const data = await queryClient?.ensureQueryData(tasks.get(params.taskId));
    return data;
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
    <form
      className="grid gap-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const updated = await mutateAsync({
          id,
          isCompleted: formData.get("isCompleted") === "on",
          text: String(formData.get("text")),
        });

        await invalidate();
        navigate({ to: "/tasks/$taskId", params: { taskId: updated._id } });
      }}
    >
      <h1 className="text-2xl font-bold">Edit</h1>
      <div>
        <label className="floating-label">
          <span>Text</span>
          <input
            autoFocus
            placeholder="Text"
            className="input input-md"
            required
            name="text"
            autoComplete="off"
            defaultValue={text}
          />
        </label>
      </div>
      <div className="flex justify-between">
        <label htmlFor="isCompleted">Is Completed</label>
        <input
          className="toggle"
          type="checkbox"
          id="isCompleted"
          name="isCompleted"
          defaultChecked={isCompleted}
        />
      </div>
      <div className="flex gap-x-3 mr-auto">
        <Link
          to={"/tasks/$taskId"}
          params={{ taskId: id }}
          className="btn btn-outline"
        >
          Cancel
        </Link>
        <button className="btn btn-primary">Save</button>
      </div>
    </form>
  );
}
