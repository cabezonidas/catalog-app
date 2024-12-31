import { createFileRoute, Link } from "@tanstack/react-router";
import { tasks } from "../../../convex/tasks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "../../middlewares/authMiddleware";

const isAuth = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {});

export const Route = createFileRoute("/tasks/")({
  loader: async ({ context: { queryClient } }) => {
    await isAuth();
    await queryClient.ensureQueryData(tasks.list());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(tasks.list());
  return (
    <div style={{ display: "grid", rowGap: 10 }}>
      <div>Hello "/tasks/"!</div>
      <div>
        {data.map(({ _id, text, isCompleted }) => (
          <div key={_id}>
            <span>{isCompleted ? "✅" : "❌"}</span>
            <Link to="/tasks/$taskId/edit" params={{ taskId: _id }}>
              {text}
            </Link>
          </div>
        ))}
      </div>
      <div>
        <Link to="/tasks/new">New</Link>
      </div>
    </div>
  );
}
