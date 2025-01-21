import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { products } from "../../../convex/products";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AddItemDialog } from "./-ui/AddItemDialog";
import { useCatalog } from "./-ui/useCatalog";

const isAdmin = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.isAdmin) {
      throw Error("Not authorized");
    }
  });

export const Route = createFileRoute("/admin/")({
  loader: async ({ context: { queryClient } }) => {
    await isAdmin();
    return { catalog: await queryClient.ensureQueryData(products.list()) };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(products.list());
  const { catalog, deleteGroup, deleteItem, addItem, addGroup } =
    useCatalog(data);

  type Group = (typeof catalog)[number];
  const [selectedGroup, setSelectedGroup] = useState<Group>();
  const addItemDialog = useRef<HTMLDialogElement>(null);

  const openModal = (group?: Group) => {
    setSelectedGroup(group);
    addItemDialog.current?.showModal();
  };

  return (
    <>
      <AddItemDialog
        ref={addItemDialog}
        group={selectedGroup}
        onAdd={({ name, ingredients, price }) => {
          if (selectedGroup) {
            addItem({ groupId: selectedGroup._id, name, price });
          } else {
            addGroup({ name, price, ingredients });
          }
          addItemDialog.current?.close();
        }}
        onClose={() => setSelectedGroup(undefined)}
      />
      <div className="grid h-screen max-h-screen overflow-hidden grid-rows-[1fr_auto]">
        <div className="overflow-auto">
          <table className="table">
            <thead className="sticky top-0 bg-white dark:bg-black z-10">
              <tr>
                <th>Producto</th>
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
                              deleteItem({
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
                    {group.items.length === 0 && (
                      <div className="flex justify-around">
                        <button
                          type="button"
                          className="btn btn-ghost m-auto"
                          onClick={() => openModal(group)}
                        >
                          {`Agregar opción de ${group.name.trim()}`}
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      className="toggle"
                      type="checkbox"
                      name={`id:${group._id}-isActive`}
                      aria-label={`${group.name} visible`}
                      {...(group.items.length === 0
                        ? { disabled: true, readOnly: true, checked: false }
                        : { defaultChecked: group.isActive })}
                    />
                  </td>
                  <td>
                    <div>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => openModal(group)}
                      >
                        Agregar opción
                      </button>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => deleteGroup(group._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex content-center p-4">
          <div className="m-auto">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => addItemDialog.current?.showModal()}
            >
              Nuevo producto
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
