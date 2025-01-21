import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { products } from '../../../convex/products';
import { useSuspenseQuery } from '@tanstack/react-query';

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

function RouteComponent() {
  const { data } = useSuspenseQuery(products.list());

  const priority = data
    .filter((p) => p.isActive && p.items.length)
    .map((p) => ({ ...p, name: p.name.trim() }))
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  const rest = data.filter((p) => !priority.some((c) => c._id === p._id));

  const catalog = [...priority, ...rest];

  return (
    <div>
      <div className="text-lg">Catálogo</div>
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Variedad</th>
            <th>Visible</th>
          </tr>
        </thead>
        <tbody>
          {catalog.map((group) => (
            <tr className="hover" key={group._id}>
              <td className="grid">
                <input
                  placeholder="Nombre"
                  className="input input-lg input-ghost pl-0"
                  required
                  autoComplete="off"
                  defaultValue={group.name}
                />
                <textarea
                  placeholder="Nombre"
                  className="textarea textarea-ghost pl-0"
                  required
                  autoComplete="off"
                  defaultValue={group.ingredients}
                />
              </td>
              <td>
                <div className="grid gap-y-2">
                  {group.items.map((i, index) => (
                    <ul key={i.productId || index} className="flex">
                      <input
                        placeholder="Nombre"
                        className="block input input-ghost w-full max-w-xs pl-0"
                        required
                        autoComplete="off"
                        defaultValue={i.displayName}
                      />
                      <label className="input">
                        <span className="label">
                          <div>
                            <div>Precio</div>
                            <div className="text-xs">${i.price}</div>
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
                        />
                      </label>
                    </ul>
                  ))}
                </div>
              </td>
              <td>
                <input
                  className="toggle"
                  type="checkbox"
                  id={`${group._id}-isActive`}
                  name={`${group._id}-isActive`}
                  defaultChecked={group.isActive}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
