import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../convex/_generated/api";
import { useMutation } from "@tanstack/react-query";

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
    <form
      className="grid gap-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const created = await mutateAsync({
          isCompleted: false,
          text: String(formData.get("text")),
        });
        navigate({ to: "/tasks/$taskId", params: { taskId: created._id } });
      }}
    >
      <h1 className="text-2xl font-bold">New</h1>
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
          />
        </label>
      </div>
      <div className="flex gap-x-3 mr-auto">
        <Link to={"/tasks"} className="btn btn-outline">
          Cancel
        </Link>
        <button className="btn btn-primary">Add</button>
      </div>
    </form>
  );
}
