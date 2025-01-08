import {
  createFileRoute,
  Link,
  Outlet,
  useChildMatches,
} from "@tanstack/react-router";
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
  const childMatches = useChildMatches();
  const {
    data: { text, isCompleted },
  } = useSuspenseQuery(tasks.get(id));

  if (childMatches.length) {
    return <Outlet />;
  }

  return (
    <div className="grid gap-y-4">
      <Link to="/tasks" className="underline">
        Tasks
      </Link>
      <h1 className="text-4xl font-bold">{text}</h1>
      <div>
        {isCompleted
          ? "🟢 Well done! You've made it"
          : "🟡 One day you'll do it..."}
      </div>
      <Link
        className="mr-auto btn btn-outline"
        to="/tasks/$taskId/edit"
        params={{ taskId: id }}
      >
        Edit
      </Link>
    </div>
  );
}
