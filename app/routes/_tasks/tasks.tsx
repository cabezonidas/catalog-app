import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center min-h-screen">
      <div className="card bg-base-100 w-80 shadow-xl p-4 m-auto">
        <Outlet />
      </div>
    </div>
  );
}
