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
    <div>
      <h2>List</h2>
      <ol>
        {data.map(({ _id, text, isCompleted }) => (
          <li key={_id}>
            <span>{isCompleted ? "✅" : "❌"} </span>
            <Link to="/tasks/$taskId/edit" params={{ taskId: _id }}>
              {text}
            </Link>
          </li>
        ))}
      </ol>
      <div>
        <Link to="/tasks/new">Add +</Link>
      </div>
    </div>
  );
}
