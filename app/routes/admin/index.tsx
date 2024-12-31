import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "../../middlewares/authMiddleware";

const isAdmin = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.isAdmin) {
      throw Error("Not authorized");
    }
  });

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    await isAdmin();
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/"!</div>;
}
