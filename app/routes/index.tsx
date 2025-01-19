import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "../../convex/products";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context: { queryClient } }) => {
    return {
      catalog: await queryClient.ensureQueryData(products.publicList()),
    };
  },
});

function Home() {
  const { catalog } = Route.useLoaderData();

  return (
    <div>
      {catalog.map((p) => (
        <div key={p.id}>
          <div></div>
          <div>
            <div>{p.name}</div>
            <div>{p.ingredients}</div>
          </div>
          <div>{p.price}</div>
        </div>
      ))}
      <SignedIn>
        <div>
          <Link className="link" to="/tasks">
            Tasks
          </Link>
        </div>
      </SignedIn>

      <SignedOut>
        <div>
          <SignInButton />
        </div>
      </SignedOut>
    </div>
  );
}
