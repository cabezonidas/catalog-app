import { createServerFn } from "@tanstack/start";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "vinxi/http";
import { createClerkClient } from "@clerk/backend";

export const fetchClerkAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId } = await getAuth(getWebRequest());

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const user = userId ? await clerkClient.users.getUser(userId) : null;

    return {
      userId,
      userEmail: user?.emailAddresses.at(0)?.emailAddress,
    };
  }
);
