import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1>TASKS</h1>
      <Outlet />
    </div>
  );
}
