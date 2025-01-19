import { convexQuery } from "@convex-dev/react-query";
import { query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const products = {
  list: () => convexQuery(api.products.getProducts, {}),
  publicList: () => convexQuery(api.products.getPublicProducts, {}),
  get: (id: string) => convexQuery(api.products.getProducts, { id }),
};

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const getPublicProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((x) => x.eq(x.field("isActive"), true))
      .collect();
    return products
      .filter((p) => p.items.length > 0)
      .map((x) =>
        x.items.map((i) => ({
          ingredients: x.ingredients.trim(),
          name: i.displayName.trim(),
          price: i.price,
        }))
      )
      .flatMap((x) => x)
      .sort((a, b) => (a.name < b.name ? 1 : -1))
      .map((i, index) => ({ id: index + 1, ...i }));
  },
});

export const getProduct = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(ctx.db.normalizeId("products", args.id)!);
    if (!task) {
      throw Error("Not found");
    }
    return task;
  },
});
