import { RefObject } from 'react';

export const AddGroupDialog = ({
  ref,
  onAdd,
  onClose,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  onAdd: (props: { name: string; ingredients: string; price: number }) => void;
  onClose?: () => void;
}) => {
  const newGroupName = 'new-group-name';
  const newGroupIngredients = 'new-group-ingredients';
  const newGroupPrice = 'new-group-price';
  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <form
        className="modal-box"
        onSubmit={(e) => {
          const formData = new FormData(e.currentTarget);
          e.preventDefault();
          onAdd({
            name: String(formData.get(newGroupName)),
            ingredients: String(formData.get(newGroupIngredients)),
            price: Number(formData.get(newGroupPrice)),
          });
          e.currentTarget.reset();
        }}
      >
        <h3 className="font-bold text-lg">Nuevo producto!</h3>
        <div className="py-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Nombre</legend>
            <input
              name={newGroupName}
              required
              type="text"
              className="input"
              aria-label="Nombre"
              placeholder="ej. Pastel del Oeste"
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Ingredientes</legend>
            <textarea
              name={newGroupIngredients}
              required
              className="textarea"
              aria-label="Ingredientes"
              placeholder="ej. Pie, Ganache De Chocolate Marmolado Y Macadamia"
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Precio</legend>
            <input
              name={newGroupPrice}
              required
              type="number"
              className="input"
              aria-label="Nombre"
              placeholder="ej. 45000"
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
