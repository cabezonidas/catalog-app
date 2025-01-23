import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { products } from "../../../convex/products";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AddItemDialog } from "./-ui/AddItemDialog";
import { useCatalog } from "./-ui/useCatalog";
import { Id } from "../../../convex/_generated/dataModel";
import deepEqual from "fast-deep-equal";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";

function useUpdateMutation() {
  const mutationFn = useConvexMutation(api.products.setProducts);
  return useMutation({ mutationFn });
}

const isAdmin = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.isAdmin) {
      throw Error("Not authorized");
    }
  });

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => isAdmin(),
  loader: ({ context: { queryClient } }) =>
    queryClient?.ensureQueryData(products.list()),
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

  const groupControl = (
    groupId: Id<"products"> | number,
    field: "name" | "ingredients" | "isActive"
  ) => `id:${groupId}-${field}`;

  const itemControl = (
    groupId: Id<"products"> | number,
    productId: number,
    field: "option" | "price"
  ) => `id:${groupId}-product:${productId}-${field}`;

  const getData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    type CatalogItem = (typeof data)[number];
    const modified = data
      .map((group) => ({
        group,
        state: catalog.find((c) => c._id === group._id),
      }))
      .filter(({ state }) => state !== undefined)
      .reduce<CatalogItem[]>((res, { group, state }) => {
        const asBoolean = (field: string) => formData.get(field) === "on";
        const asString = (field: string) => `${formData.get(field)}`;
        const asNumber = (field: string) => Number(formData.get(field));
        const newProps = {
          name: asString(groupControl(group._id, "name")),
          ingredients: asString(groupControl(group._id, "ingredients")),
          isActive: group.items.length
            ? asBoolean(groupControl(group._id, "isActive"))
            : group.isActive,
          items: state!.items.map((item) => {
            const name = asString(
              itemControl(group._id, item.productId, "option")
            );
            const price = asNumber(
              itemControl(group._id, item.productId, "price")
            );
            return {
              ...item,
              displayName: name,
              price,
              priceInStore: price,
            };
          }),
        };
        const newGroup = { ...group, ...newProps } as CatalogItem;
        if (!deepEqual(newGroup, group)) {
          res = [...res, newGroup];
        }
        return res;
      }, [])
      .map(({ _id, _creationTime, ...value }) => ({ _id, value }));

    const deleted = data
      .filter((group) => !catalog.find((c) => c._id === group._id))
      .map((c) => c._id);

    const added = catalog
      .filter((c) => typeof c._id === "number")
      .map(({ _id, _creationTime, ...rest }) => ({ ...rest }));

    if (added.length + deleted.length + modified.length) {
      return { added, deleted, modified };
    }
  };

  const { mutateAsync, isPending } = useUpdateMutation();
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
      <form
        className="grid h-screen max-h-screen overflow-hidden grid-rows-[1fr_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          const payload = getData(e.currentTarget);
          if (payload) {
            const { added, deleted, modified } = payload;
            try {
              await mutateAsync({ added, deleted, modified });
            } catch {
              alert("Hubo un error y no se guardaron los cambios");
            }
          }
        }}
      >
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
                  <td className="relative">
                    <div className="grid grid-rows-[auto_1fr] h-[100%]">
                      <input
                        name={groupControl(group._id, "name")}
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
                        name={groupControl(group._id, "ingredients")}
                        aria-label="Ingredientes"
                      />
                    </div>
                  </td>
                  <td>
                    <ul className="grid gap-y-2">
                      {group.items.map((i) => (
                        <li
                          key={i.productId}
                          className="flex last-of-type:mb-2 items-center gap-x-2 first-of-type:mt-12"
                        >
                          <input
                            placeholder="Nombre"
                            className="input input-ghost w-full max-w-xs pl-0"
                            required
                            autoComplete="off"
                            defaultValue={i.displayName}
                            name={itemControl(group._id, i.productId, "option")}
                            aria-label={`Opción de ${group.name}`}
                          />
                          <label className="input w-[180px] min-w-[180px]">
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
                              min={500}
                              step={500}
                              name={itemControl(
                                group._id,
                                i.productId,
                                "price"
                              )}
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
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-around">
                      <button
                        type="button"
                        className={
                          group.items.length === 0
                            ? "btn btn-ghost m-auto"
                            : "btn btn-sm btn-circle btn-ghost pointer m-auto"
                        }
                        onClick={() => openModal(group)}
                      >
                        {group.items.length === 0
                          ? `Agregar opción de ${group.name.trim()}`
                          : "+"}
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      className="toggle"
                      type="checkbox"
                      name={groupControl(group._id, "isActive")}
                      aria-label={`${group.name} visible`}
                      {...(group.items.length === 0
                        ? { disabled: true, readOnly: true, checked: false }
                        : { defaultChecked: group.isActive })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-error"
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
        <footer className="flex content-center p-4">
          <div className="m-auto flex gap-x-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => addItemDialog.current?.showModal()}
            >
              Nuevo producto
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                const inputs = document.querySelectorAll("input");
                inputs.forEach((i) => {
                  if (i.type === "number" && i.value && i.valueAsNumber) {
                    i.value = `${parseInt(`${i.valueAsNumber * 1.05}`)}`;
                  }
                });
              }}
            >
              Aumentar 5%
            </button>
            <button className="btn btn-primary" disabled={isPending}>
              {isPending ? (
                <span className="loading loading-spinner loading-md"></span>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </footer>
      </form>
    </>
  );
}
