import { SignedIn } from "@clerk/tanstack-start";
import * as fs from "node:fs";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";

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
  const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}));

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          updateCount({ data: 1 }).then(() => {
            router.invalidate();
          });
        }}
      >
        Add 1 to {state}?
      </button>
      <div>
        {data.map(({ _id, text }) => (
          <div key={_id}>{text}</div>
        ))}
      </div>
      <SignedIn>
        <div>
          <Link to="/admin/catalog">Catalog</Link>
        </div>
      </SignedIn>
    </div>
  );
}
