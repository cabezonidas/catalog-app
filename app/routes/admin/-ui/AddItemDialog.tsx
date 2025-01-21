import { RefObject } from "react";
import { useCatalog } from "./useCatalog";

type Group = ReturnType<typeof useCatalog>["catalog"][number];

export const AddItemDialog = ({
  group,
  ref,
  onAdd,
  onClose,
}: {
  group?: Group;
  ref: RefObject<HTMLDialogElement | null>;
  onAdd: (props: { name: string; price: number; ingredients: string }) => void;
  onClose: () => void;
}) => {
  const newName = "new-name";
  const newIngredients = "new-ingredients";
  const newPrice = "new-price";

  const heading = group?.name
    ? `Nueva variedad de ${group.name}!`
    : `Nuevo producto!`;

  const placeholderName = group
    ? `ej. ${group.name} con Crema`
    : "Pastel del Oeste";
  const placeholderPrice = `ej. ${group?.items.at(0)?.price ?? 40000}`;

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={(e) => {
        e.currentTarget.getElementsByTagName("form")[0]?.reset();
        onClose();
      }}
    >
      <form
        className="modal-box"
        onSubmit={(e) => {
          const formData = new FormData(e.currentTarget);
          e.preventDefault();
          onAdd({
            name: String(formData.get(newName)),
            ingredients: !group ? String(formData.get(newIngredients)) : "",
            price: Number(formData.get(newPrice)),
          });
        }}
      >
        <h3 className="font-bold text-lg">{heading}</h3>
        <div className="py-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Nombre</legend>
            <input
              name={newName}
              required
              type="text"
              className="input"
              aria-label="Nombre"
              placeholder={placeholderName}
              autoComplete="off"
            />
          </fieldset>
          {!group && (
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Ingredientes</legend>
              <textarea
                name={newIngredients}
                required
                className="textarea"
                aria-label="Ingredientes"
                placeholder="ej. Pie, Ganache De Chocolate Marmolado Y Macadamia"
                autoComplete="off"
              />
            </fieldset>
          )}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Precio</legend>
            <input
              name={newPrice}
              required
              type="number"
              className="input"
              aria-label="Nombre"
              placeholder={placeholderPrice}
              autoComplete="off"
            />
          </fieldset>
        </div>
        <button className="btn btn-active btn-success mt-4 w-max">
          Agregar
        </button>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>Cancelar</button>
      </form>
    </dialog>
  );
};
