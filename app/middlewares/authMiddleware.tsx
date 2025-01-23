import { createMiddleware } from "@tanstack/start";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "vinxi/http";
import { createClerkClient } from "@clerk/backend";

const whitelistedEmails = [
  "sebastian.cabeza@proton.me",
  "cabeza1961@gmail.com",
  "marcelardec@gmail.com",
];

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { userId, has } = await getAuth(getWebRequest(), {});

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const user = userId ? await clerkClient.users.getUser(userId) : null;

  if (!user) {
    throw Error("Not authenticated");
  }

  const isVerified =
    user.primaryEmailAddress?.verification?.status === "verified";
  const isWhitelisted = whitelistedEmails.some(
    (i) => i === user.primaryEmailAddress?.emailAddress
  );

  return next({
    context: { user, isAdmin: isVerified && isWhitelisted },
  });
});
