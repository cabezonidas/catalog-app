import {
  createFileRoute,
  Link,
  Outlet,
  useChildMatches,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const isTop = useChildMatches().every(
    (c) => c.fullPath === Route.fullPath + "/"
  );
  const TasksHeading = () => <h1>TASKS</h1>;
  return (
    <div>
      {!isTop ? (
        <Link to="/tasks">
          <TasksHeading />
        </Link>
      ) : (
        <TasksHeading />
      )}
      <Outlet />
    </div>
  );
}
