import { useCallback, useState } from 'react';
import { products } from '../../../../convex/products';
import { Id } from '../../../../convex/_generated/dataModel';

type Catalog = Awaited<
  ReturnType<NonNullable<ReturnType<(typeof products)['list']>['queryFn']>>
>;

type Group = Catalog[number];
type Items = Group['items'];

export const useCatalog = (data: Catalog) => {
  const [catalog, setCatalog] = useState(data);

  const deleteGroup = useCallback(
    (groupId: Id<'products'>) =>
      setCatalog((prev) => prev.filter((product) => product._id !== groupId)),
    []
  );

  const deleteGroupItem = useCallback(
    (props: { groupId: Id<'products'>; productId: number }) =>
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

  const addGroupItem = useCallback(
    (props: { groupId: Id<'products'>; name: string; price: number }) =>
      setCatalog((prev) => {
        const makeGroupId = (items: Items) =>
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
                    displayName: props.name,
                    price: props.price,
                    priceInStore: props.price,
                    pieDetailId: product.pieDetailId,
                    productId: makeGroupId(product.items),
                    category: '',
                    displayDescription: '',
                    flavour: '',
                    minOrderAmount: 1,
                    multipleAmount: 1,
                    portions: 1,
                    preparationTime: 1,
                    sizeDescription: '',
                    temperature: '',
                  },
                ],
              }
            : product
        );
      }),
    []
  );

  return { catalog, deleteGroup, deleteGroupItem, addGroupItem };
};
