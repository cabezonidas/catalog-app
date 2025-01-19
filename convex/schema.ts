import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    flickrAlbumId: v.string(),
    ingredients: v.string(),
    isActive: v.boolean(),
    isPieOfTheWeek: v.boolean(),
    items: v.array(
      v.object({
        category: v.string(),
        displayDescription: v.string(),
        displayName: v.string(),
        flavour: v.string(),
        minOrderAmount: v.float64(),
        multipleAmount: v.float64(),
        pieDetailId: v.float64(),
        portions: v.float64(),
        preparationTime: v.float64(),
        price: v.float64(),
        priceInStore: v.float64(),
        productId: v.float64(),
        sizeDescription: v.string(),
        temperature: v.string(),
      })
    ),
    longDescription: v.union(v.null(), v.string()),
    name: v.string(),
    pieDetailId: v.float64(),
    shortDescription: v.union(v.null(), v.string()),
  }),
  tasks: defineTable({
    isCompleted: v.boolean(),
    text: v.string(),
  }),
});
