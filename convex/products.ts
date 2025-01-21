import { convexQuery } from '@convex-dev/react-query';
import { query } from './_generated/server';
import { api } from './_generated/api';
import { v } from 'convex/values';

export const products = {
  list: () => convexQuery(api.products.getProducts, {}),
  publicList: () => convexQuery(api.products.getPublicProducts, {}),
  get: (id: string) => convexQuery(api.products.getProducts, { id }),
};

const removeBadSpaces = (text: string) => {
  var result = text ?? '';
  if (result.endsWith('.')) {
    result = result.slice(0, result.length - 1);
  }
  result.split(' , ').join(',').trim();
  return result;
};

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    const list = (await ctx.db.query('products').collect()).map((p) => ({
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
      .query('products')
      .filter((x) => x.eq(x.field('isActive'), true))
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

export const getProduct = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(ctx.db.normalizeId('products', args.id)!);
    if (!task) {
      throw Error('Not found');
    }
    return task;
  },
});
