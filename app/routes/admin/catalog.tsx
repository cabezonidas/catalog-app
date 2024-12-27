import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-start";
import { fetchClerkAuth } from "../../fetchClerkAuth";
import { getServerTime } from "../../getServerTime";
import {
  SignedIn,
  SignOutButton,
  SignedOut,
  SignInButton,
} from "@clerk/tanstack-start";

export const Route = createFileRoute("/admin/catalog")({
  loader: async () => {
    const { userEmail } = await fetchClerkAuth();
    const serverTime = await getServerTime();

    return { userEmail, serverTime };
  },
  component: RouteComponent,
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return (
        <div className="flex items-center justify-center p-12">
          <SignIn routing="hash" forceRedirectUrl={window.location.href} />
        </div>
      );
    }

    throw error;
  },
});

function RouteComponent() {
  const state = Route.useLoaderData();
  return (
    <div>
      <SignedIn>
        <div>Hello {state.userEmail}</div>
        <div>Server time: {state.serverTime}</div>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <p>You are signed out</p>

        <SignInButton />
      </SignedOut>
    </div>
  );
}
