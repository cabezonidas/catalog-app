import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { products } from '../../../convex/products';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { AddGroupItemDialog } from './-ui/AddGroupItemDialog';
import { useCatalog } from './-ui/useCatalog';
import { AddGroupDialog } from './-ui/AddGroupDialog';

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
  const { catalog, deleteGroup, deleteGroupItem, addGroupItem, addGroup } =
    useCatalog(data);

  const [selectedGroup, setSelectedGroup] =
    useState<(typeof catalog)[number]>();

  const addGroupItemDialog = useRef<HTMLDialogElement>(null);
  const addGroupDialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <AddGroupItemDialog
        ref={addGroupItemDialog}
        groupName={selectedGroup?.name ?? ''}
        placeholderName={
          selectedGroup ? `ej. ${selectedGroup.name} con Crema` : undefined
        }
        placeholderPrice={selectedGroup?.items.at(0)?.price}
        onAdd={(props) => {
          if (selectedGroup) {
            addGroupItem({
              groupId: selectedGroup._id,
              name: props.name,
              price: props.price,
            });
          }
          setSelectedGroup(undefined);
          addGroupItemDialog.current?.close();
        }}
        onClose={() => setSelectedGroup(undefined)}
      />
      <AddGroupDialog
        ref={addGroupDialog}
        onAdd={(props) => {
          addGroup(props);
          addGroupDialog.current?.close();
        }}
      />
      <div>
        <div className="text-lg">Catálogo</div>
        <button
          type="button"
          onClick={() => addGroupDialog.current?.showModal()}
        >
          Nuevo producto
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>Groupo</th>
              <th>Variedad</th>
              <th>Visible</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((group) => (
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
                    {group.items.map((i) => (
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
                              <div className="text-xs">{`$${i.price}`}</div>
                            </div>
                          </span>
                          <input
                            placeholder="Precio"
                            className="input input-ghost w-full max-w-xs pl-0"
                            required
                            autoComplete="off"
                            defaultValue={i.price}
                            type="number"
                            min={1000}
                            step={1000}
                            name={`id:${group._id}-product:${i.productId}-price`}
                            aria-label={`Precio de ${i.displayName}`}
                          />
                        </label>
                        <button
                          className="btn btn-sm btn-circle btn-ghost pointer"
                          type="button"
                          onClick={() =>
                            deleteGroupItem({
                              groupId: group._id,
                              productId: i.productId,
                            })
                          }
                        >
                          ✕
                        </button>
                      </ul>
                    ))}
                  </div>
                  <div className="flex justify-around">
                    <button
                      type="button"
                      className={
                        group.items.length > 0
                          ? 'btn btn-sm btn-circle btn-ghost pointer'
                          : 'btn btn-ghost m-auto'
                      }
                      onClick={() => {
                        addGroupItemDialog.current?.showModal();
                        setSelectedGroup(group);
                      }}
                    >
                      {group.items.length > 0
                        ? '+'
                        : `Agregar opción de ${group.name.trim()}`}
                    </button>
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
                    onClick={() => deleteGroup(group._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
