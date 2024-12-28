import { createFileRoute, Link } from "@tanstack/react-router";
import { useOrganizationList } from "@clerk/tanstack-start";
import { fetchClerkAuth } from "../../fetchClerkAuth";
import { SignOutButton, SignInButton } from "@clerk/tanstack-start";

export const Route = createFileRoute("/admin/catalog")({
  loader: async () => {
    const { user } = await fetchClerkAuth();
    if (!user) {
      throw Error("Not authenticated");
    }
    if (!user.isAdmin) {
      throw Error("Not authorized");
    }
    return user;
  },
  component: RouteComponent,
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return (
        <div>
          <p>You are signed out</p>
          <SignInButton />
        </div>
      );
    }
    if (error.message === "Not authorized") {
      return (
        <div>
          <div>Not authorized</div>
          <SignOutButton />
        </div>
      );
    }

    throw error;
  },
});

function RouteComponent() {
  const { setActive } = useOrganizationList();

  setActive?.({ organization: "delasartes" });

  return (
    <div>
      <div>Catalog</div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <SignOutButton />
    </div>
  );
}
