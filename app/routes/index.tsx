import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-start";
import * as fs from "node:fs";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";

const filePath = "count.txt";

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, "utf-8").catch(() => "0")
  );
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

const updateCount = createServerFn({ method: "POST" })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount();
    await fs.promises.writeFile(filePath, `${count + data}`);
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <div>
      <button
        type="button"
        className="text-base cursor-pointer underline fixed bottom-2 right-2"
        onClick={() => {
          updateCount({ data: 1 }).then(() => {
            router.invalidate();
          });
        }}
      >
        {state} Clicks
      </button>

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
