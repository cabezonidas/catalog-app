import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { tasks } from "../../../../convex/tasks";

export const Route = createFileRoute("/_tasks/tasks/$taskId")({
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData(tasks.get(params.taskId));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const id = Route.useParams().taskId;
  const {
    data: { text, isCompleted },
  } = useSuspenseQuery(tasks.get(id));
  return (
    <div>
      <h2>
        <span>{isCompleted ? "✅" : "❌"} </span>
        <span>{text}</span>
      </h2>
      <div>
        <Link to="/tasks/$taskId/edit" params={{ taskId: id }}>
          Edit
        </Link>
      </div>
    </div>
  );
}
