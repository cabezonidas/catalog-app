import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { products } from '../../../convex/products';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Id } from '../../../convex/_generated/dataModel';

type Catalog = Awaited<
  ReturnType<NonNullable<ReturnType<(typeof products)['list']>['queryFn']>>
>;

const sortCatalog = (data: Catalog): Catalog => {
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

const isAdmin = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.isAdmin) {
      throw Error('Not authorized');
    }
  });

export const Route = createFileRoute('/admin/')({
  loader: async ({ context: { queryClient } }) => {
    await isAdmin();
    return { catalog: await queryClient.ensureQueryData(products.list()) };
  },
  component: RouteComponent,
});

const getInitialPrice = (props: {
  catalog: Catalog;
  productId: number;
  _id: Id<'products'>;
}) =>
  props.catalog
    .find((p) => p._id === props._id)
    ?.items?.find((i) => i.productId === props.productId)?.price;

function RouteComponent() {
  const { data } = useSuspenseQuery({
    ...products.list(),
    select: sortCatalog,
  });
  const [catalog, setCatalog] = useState(data);

  return (
    <div>
      <div className="text-lg">Catálogo</div>
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Variedad</th>
            <th>Visible</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {catalog.map((group, groupIndex) => (
            <tr className="hover" key={group._id}>
              <td className="grid">
                <input
                  name={`id:${group._id}-name`}
                  placeholder="Nombre"
                  className="input input-lg input-ghost pl-0"
                  required
                  autoComplete="off"
                  defaultValue={group.name}
                  aria-label="Nombre"
                />
                <textarea
                  placeholder="Nombre"
                  className="textarea textarea-ghost pl-0"
                  required
                  autoComplete="off"
                  defaultValue={group.ingredients}
                  name={`id:${group._id}-ingredients`}
                  aria-label="Ingredientes"
                />
              </td>
              <td>
                <div className="grid gap-y-2">
                  {group.items.map((i, itemIndex) => (
                    <ul key={i.productId} className="flex">
                      <input
                        placeholder="Nombre"
                        className="input input-ghost w-full max-w-xs pl-0"
                        required
                        autoComplete="off"
                        defaultValue={i.displayName}
                        name={`id:${group._id}-product:${i.productId}-option`}
                        aria-label={`Opción de ${group.name}`}
                      />
                      <label className="input">
                        <span className="label">
                          <div>
                            <div>Precio</div>
                            <div className="text-xs">
                              {`$${getInitialPrice({ catalog, productId: i.productId, _id: group._id })}`}
                            </div>
                          </div>
                        </span>
                        <input
                          placeholder="Precio"
                          className="input input-ghost w-full max-w-xs pl-0"
                          required
                          autoComplete="off"
                          defaultValue={i.price}
                          type="number"
                          min={500}
                          step={100}
                          name={`id:${group._id}-product:${i.productId}-price`}
                          aria-label={`Precio de ${i.displayName}`}
                        />
                      </label>
                      <button
                        className="btn btn-sm btn-circle btn-ghost pointer"
                        type="button"
                        onClick={() =>
                          setCatalog((prev) => {
                            return prev.map((pi) =>
                              group._id === pi._id
                                ? {
                                    ...pi,
                                    items: pi.items.filter(
                                      (ipi) => ipi.productId !== i.productId
                                    ),
                                  }
                                : pi
                            );
                          })
                        }
                      >
                        ✕
                      </button>
                    </ul>
                  ))}
                </div>
                <div className="flex justify-around">
                  {group.items.length > 0 ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-circle btn-ghost pointer"
                    >
                      +
                    </button>
                  ) : (
                    <button type="button" className="btn btn-ghost m-auto">
                      Agregar opción de {group.name.trim()}
                    </button>
                  )}
                </div>
              </td>
              <td>
                <input
                  className="toggle"
                  type="checkbox"
                  name={`id:${group._id}-isActive`}
                  defaultChecked={group.isActive}
                  aria-label={`${group.name} visible`}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() =>
                    setCatalog((prev) =>
                      prev.filter((pi) => group._id !== pi._id)
                    )
                  }
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
