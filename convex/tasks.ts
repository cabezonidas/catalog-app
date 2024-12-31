import { convexQuery } from "@convex-dev/react-query";
import { query, mutation } from "./_generated/server";
import { api } from "../convex/_generated/api";
import { v } from "convex/values";

export const tasks = {
  list: () => convexQuery(api.tasks.getTasks, {}),
  get: (id: string) => convexQuery(api.tasks.getTask, { id }),
};

export const getTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getTask = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(ctx.db.normalizeId("tasks", args.id)!);
  },
});

export const setTask = mutation({
  args: {
    id: v.optional(v.string()),
    isCompleted: v.boolean(),
    text: v.string(),
  },

  handler: async (ctx, args) => {
    const { id, isCompleted, text } = args;
    let documentId = id ? ctx.db.normalizeId("tasks", id) : undefined;
    const document = documentId ? await ctx.db.get(documentId) : null;
    if (document === null) {
      documentId = await ctx.db.insert("tasks", { isCompleted, text });
    } else {
      await ctx.db.patch(documentId!, { isCompleted, text });
    }
    return await ctx.db.get(documentId!);
  },
});
