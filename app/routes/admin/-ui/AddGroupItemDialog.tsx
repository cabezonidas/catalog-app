import { RefObject } from 'react';

export const AddGroupItemDialog = ({
  placeholderName,
  placeholderPrice,
  groupName,
  ref,
  onAdd,
  onClose,
}: {
  placeholderName?: string;
  placeholderPrice?: number;
  groupName: string;
  ref: RefObject<HTMLDialogElement | null>;
  onAdd: (props: { name: string; price: number }) => void;
  onClose: () => void;
}) => {
  const newItemName = 'new-item-name';
  const newItemPrice = 'new-item-price';
  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <form
        className="modal-box"
        onSubmit={(e) => {
          const formData = new FormData(e.currentTarget);
          e.preventDefault();
          onAdd({
            name: String(formData.get(newItemName)),
            price: Number(formData.get(newItemPrice)),
          });
          e.currentTarget.reset();
        }}
      >
        <h3 className="font-bold text-lg">Nueva variedad de {groupName}!</h3>
        <div className="py-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Nombre</legend>
            <input
              name={newItemName}
              required
              type="text"
              className="input"
              aria-label="Nombre"
              placeholder={placeholderName}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Precio</legend>
            <input
              name={newItemPrice}
              required
              type="number"
              className="input"
              aria-label="Nombre"
              placeholder={`ej. ${placeholderPrice}`}
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
