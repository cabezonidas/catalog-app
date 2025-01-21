import { useCallback, useState } from 'react';
import { products } from '../../../../convex/products';
import { Id } from '../../../../convex/_generated/dataModel';

type Catalog = Awaited<
  ReturnType<NonNullable<ReturnType<(typeof products)['list']>['queryFn']>>
>;

type Group = Omit<Catalog[number], '_id'> & { _id: number | Id<'products'> };
type Items = Group['items'];

export const useCatalog = (data: Group[]) => {
  const [catalog, setCatalog] = useState(data);

  const deleteGroup = useCallback(
    (groupId: Id<'products'> | number) =>
      setCatalog((prev) => prev.filter((product) => product._id !== groupId)),
    []
  );

  const deleteGroupItem = useCallback(
    (props: { groupId: Id<'products'> | number; productId: number }) =>
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

  const groupBase = {
    _creationTime: 0,
    flickrAlbumId: '',
    isPieOfTheWeek: false,
    longDescription: null,
    shortDescription: null,
  };
  const itemBase = {
    category: '',
    displayDescription: '',
    flavour: '',
    minOrderAmount: 1,
    multipleAmount: 1,
    portions: 1,
    preparationTime: 1,
    sizeDescription: '',
    temperature: '',
  };

  const addGroupItem = useCallback(
    (props: {
      groupId: Id<'products'> | number;
      name: string;
      price: number;
    }) =>
      setCatalog((prev) => {
        const makeItemId = (items: Items) =>
          items.reduce(
            (res, item) => (item.productId >= res ? item.productId + 1 : res),
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
                    productId: makeItemId(product.items),
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
            .filter((p) => typeof p._id === 'number')
            .map((p) => p._id as number)
            .sort()
            .at(-1) ?? 0) + 1;
        const makeGroupId = (items: Items) =>
          items.reduce(
            (res, item) => (item.productId >= res ? item.productId + 1 : res),
            1
          );
        const pieDetailId = Math.floor(Math.random() * 100000);
        return [
          {
            ...groupBase,
            _id: newId,
            pieDetailId,
            name: props.name,
            ingredients: props.ingredients,
            isActive: true,
            items: [
              {
                ...itemBase,
                displayName: props.name,
                price: props.price,
                priceInStore: props.price,
                pieDetailId: pieDetailId,
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

  return { catalog, deleteGroup, deleteGroupItem, addGroupItem, addGroup };
};
