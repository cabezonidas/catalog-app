import { createMiddleware } from "@tanstack/start";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "vinxi/http";
import { createClerkClient } from "@clerk/backend";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { userId, has } = await getAuth(getWebRequest(), {});

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const user = userId ? await clerkClient.users.getUser(userId) : null;

  if (!user) {
    throw Error("Not authenticated");
  }

  return next({
    context: { user, isAdmin: has({ permission: "org:catalog:manage" }) },
  });
});
