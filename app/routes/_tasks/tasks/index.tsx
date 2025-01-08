import { createFileRoute, Link } from "@tanstack/react-router";
import { tasks } from "../../../../convex/tasks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const isAuth = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {});

export const Route = createFileRoute("/_tasks/tasks/")({
  loader: async ({ context: { queryClient } }) => {
    await isAuth();
    await queryClient.ensureQueryData(tasks.list());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(tasks.list());
  return (
    <div className="grid grid-rows-[auto_1fr_auto] overflow-hidden max-h-screen gap-y-4">
      <h1 className="text-4xl font-bold">List</h1>
      <ol className="grid gap-y-2 overflow-auto max-h-56">
        {data.map(({ _id, text, isCompleted }) => (
          <li key={_id}>
            <span>{isCompleted ? "🟢" : "🟡"} </span>
            <Link to="/tasks/$taskId" params={{ taskId: _id }}>
              {text}
            </Link>
          </li>
        ))}
      </ol>
      <Link to="/tasks/new" className="btn mr-auto">
        Add task
      </Link>
    </div>
  );
}
