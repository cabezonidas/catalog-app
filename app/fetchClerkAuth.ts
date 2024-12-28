import { createServerFn } from "@tanstack/start";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "vinxi/http";
import { createClerkClient } from "@clerk/backend";

export const fetchClerkAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId, has } = await getAuth(getWebRequest(), {});

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const user = userId ? await clerkClient.users.getUser(userId) : null;

    const isAdmin = userId
      ? has({ permission: "org:catalog:manage" })
      : undefined;

    return {
      user: user
        ? {
            id: userId,
            isAdmin: has({ permission: "org:catalog:manage" }),
          }
        : undefined,
    };
  }
);
