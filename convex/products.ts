import { convexQuery } from "@convex-dev/react-query";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import schema from "./schema";

export const products = {
  list: () => convexQuery(api.products.getProducts, {}),
  publicList: () => convexQuery(api.products.getPublicProducts, {}),
  get: (id: string) => convexQuery(api.products.getProducts, { id }),
};

const removeBadSpaces = (text: string) => {
  var result = text ?? "";
  if (result.endsWith(".")) {
    result = result.slice(0, result.length - 1);
  }
  return result.split(" , ").join(",").trim();
};

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    const list = (await ctx.db.query("products").collect()).map((p) => ({
      ...p,
      name: removeBadSpaces(p.name),
    }));

    const sortCatalog = (data: typeof list): typeof list => {
      const priority = data
        .filter((p) => p.isActive && p.items.length)
        .map((p) => ({ ...p, name: p.name.trim() }))
        .sort((a, b) => (a.name > b.name ? 1 : -1));

      const rest = data.filter((p) => !priority.some((c) => c._id === p._id));
      const restEmpty = rest
        .filter((r) => !Boolean(r.items.length))
        .sort((a, b) => (a.name > b.name ? 1 : -1));
      const restNonEmpty = rest
        .filter((r) => Boolean(r.items.length))
        .sort((a, b) => (a.name > b.name ? 1 : -1));

      return [...priority, ...restNonEmpty, ...restEmpty];
    };

    return sortCatalog(list);
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
          ingredients: removeBadSpaces(x.ingredients),
          name: removeBadSpaces(i.displayName),
          price: i.price,
        }))
      )
      .flatMap((x) => x)
      .sort((a, b) => (a.name < b.name ? 1 : -1))
      .map((i, index) => ({ id: index + 1, ...i }));
  },
});

export const setProducts = mutation({
  args: {
    added: v.array(schema.tables.products.validator),
    deleted: v.array(v.id("products")),
    modified: v.array(
      v.object({
        _id: v.id("products"),
        value: schema.tables.products.validator,
      })
    ),
  },
  handler: async (ctx, args) => {
    const { added, deleted, modified } = args;
    await Promise.all(added.map((p) => ctx.db.insert("products", p)));
    await Promise.all(deleted.map((id) => ctx.db.delete(id)));
    await Promise.all(
      modified.map(({ _id, value }) => ctx.db.replace(_id, value))
    );
    return;
  },
});
