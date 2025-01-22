import { useCallback, useState } from "react";
import { products } from "../../../../convex/products";
import { Id } from "../../../../convex/_generated/dataModel";

type Catalog = Awaited<
  ReturnType<NonNullable<ReturnType<(typeof products)["list"]>["queryFn"]>>
>;

type Group = Omit<Catalog[number], "_id"> & { _id: number | Id<"products"> };
type Items = Group["items"];

const groupBase = {
  _creationTime: 0,
  flickrAlbumId: "",
  isPieOfTheWeek: false,
  longDescription: null,
  shortDescription: null,
};

const itemBase = {
  category: "",
  displayDescription: "",
  flavour: "",
  minOrderAmount: 1,
  multipleAmount: 1,
  portions: 1,
  preparationTime: 1,
  sizeDescription: "",
  temperature: "",
};

export const useCatalog = (data: Group[]) => {
  const [catalog, setCatalog] = useState(data);

  const deleteGroup = useCallback(
    (groupId: Id<"products"> | number) =>
      setCatalog((prev) => prev.filter((product) => product._id !== groupId)),
    []
  );

  const deleteItem = useCallback(
    (props: { groupId: Id<"products"> | number; productId: number }) =>
      setCatalog((prev) =>
        prev.map((product) =>
          props.groupId === product._id
            ? {
                ...product,
                items: product.items.filter(
                  (item) => item.productId !== props.productId
                ),
              }
            : product
        )
      ),
    []
  );

  const addItem = useCallback(
    (props: {
      groupId: Id<"products"> | number;
      name: string;
      price: number;
    }) =>
      setCatalog((prev) => {
        const makeItemId = () =>
          prev
            .map((p) => p.items.map((i) => i.productId))
            .flat()
            .reduce(
              (res, productId) => (productId >= res ? productId + 1 : res),
              1
            );

        return prev.map((product) =>
          props.groupId === product._id
            ? {
                ...product,
                items: [
                  ...product.items,
                  {
                    ...itemBase,
                    displayName: props.name,
                    price: props.price,
                    priceInStore: props.price,
                    pieDetailId: product.pieDetailId,
                    productId: makeItemId(),
                  },
                ],
              }
            : product
        );
      }),
    []
  );

  const addGroup = useCallback(
    (props: { name: string; ingredients: string; price: number }) => {
      setCatalog((prev) => {
        const newId =
          (prev
            .filter((p) => typeof p._id === "number")
            .map((p) => p._id as number)
            .sort()
            .at(-1) ?? 0) + 1;
        const newPieDetailId = prev.reduce(
          (res, group) =>
            group.pieDetailId >= res ? group.pieDetailId + 1 : res,
          1
        );
        return [
          {
            ...groupBase,
            _id: newId,
            pieDetailId: newPieDetailId,
            name: props.name,
            ingredients: props.ingredients,
            isActive: true,
            items: [
              {
                ...itemBase,
                displayName: props.name,
                price: props.price,
                priceInStore: props.price,
                pieDetailId: newPieDetailId,
                productId: 1,
              },
            ],
          },
          ...prev,
        ];
      });
    },
    []
  );

  return { catalog, deleteGroup, deleteItem, addItem, addGroup };
};
