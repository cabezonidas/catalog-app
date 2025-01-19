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

export const Route = createFileRoute("/file")({
  component: RouteComponent,
  loader: async () => ({ count: await getCount() }),
});

function RouteComponent() {
  const router = useRouter();
  const { count } = Route.useLoaderData();

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <button
        type="button"
        className="text-base cursor-pointer underline"
        onClick={() => {
          updateCount({ data: 1 }).then(() => router.invalidate());
        }}
      >
        {count} Clicks
      </button>
    </div>
  );
}
