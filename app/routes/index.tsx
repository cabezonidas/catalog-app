import { createFileRoute } from "@tanstack/react-router";
import { products } from "../../convex/products";
import { useRef, useState } from "react";
import { matchSorter } from "match-sorter";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context: { queryClient } }) => {
    return {
      catalog: await queryClient?.ensureQueryData(products.publicList()),
    };
  },
});

function Home() {
  const { data: catalog } = useSuspenseQuery(products.publicList());

  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Array<number>>([]);
  const [quantity, setQuantity] = useState<{ [key: number]: number }>({});

  const sorted = matchSorter(catalog, search, {
    keys: ["name", "ingredients"],
  });

  const rest = catalog
    .filter((p) => !sorted.some((s) => s.id === p.id))
    .map((c) => ({ ...c, match: false }));

  const cart = checked.map((c) => {
    const item = catalog.find((ci) => ci.id === c)!;
    const q = quantity[c] ?? 1;
    return {
      ...item,
      amount: q,
      subtotal: q * item.price,
    };
  });

  const total = cart.reduce((res, item) => item.subtotal + res, 0);

  const waText = `¡Hola!\n
Me gustaría encargar lo siguiente:\n
${cart
  .filter((i) => i.amount)
  .map((i) => `${i.amount}x ${i.name}\n$${i.price} por unidad\n`)
  .join("\n")}
Total: $${total}\n
¡Gracias!`;

  const dialog = useRef<HTMLDialogElement>(null);

  const Row = ({ product: p }: { product: (typeof catalog)[number] }) => (
    <label
      key={p.id}
      className="grid grid-cols-[auto_1fr_auto] w-[100%] gap-x-3"
    >
      <input
        id={`product-${p.id}`}
        name={p.name}
        className="checkbox"
        type="checkbox"
        checked={checked.includes(p.id)}
        onChange={() => {
          if (checked.includes(p.id)) {
            setChecked((prev) => prev.filter((pv) => pv !== p.id));
            setQuantity((prev) => {
              delete prev[p.id];
              return prev;
            });
          } else {
            setChecked((prev) => [...prev, p.id]);
            setQuantity((prev) => ({ ...prev, [p.id]: 1 }));
          }
        }}
      />
      <div>
        <div className="font-bold">{p.name}</div>
        <div>{p.ingredients}</div>
      </div>
      <div>{p.price}</div>
    </label>
  );

  return (
    <>
      <dialog ref={dialog} className="modal">
        <div className="modal-box overflow-hidden grid grid-rows-[auto_1fr_auto_auto] max-h-[calc(100%-64px)]">
          <h3 className="font-bold text-lg">Tu pedido!</h3>
          <div className="py-4 overflow-auto">
            {cart.map(({ id, name, amount, price }) => {
              return (
                <div key={id} className="flex gap-x-1 items-center">
                  <input
                    className="input input-sm input-ghost w-18 p-l-2 mx-1"
                    type="number"
                    min={1}
                    max={10}
                    value={amount}
                    onChange={(e) => {
                      const valuAsNumber = e.target.valueAsNumber || 1;
                      setQuantity((prev) => ({
                        ...prev,
                        [id]: Math.max(Math.min(valuAsNumber, 10), 1),
                      }));
                    }}
                  />
                  <div>
                    <div>{name}</div>
                    <div className="text-sm">{`$${price} por unidad`}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>Total ${total}</div>
          <a
            className="btn btn-active btn-success mt-4 w-max"
            href={`https://wa.me/5491127778899?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Continuar por WhatsApp
          </a>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Cancelar</button>
        </form>
      </dialog>
      <div className="grid justify-center gap-y-4 p-4 overflow-hidden grid-rows-[auto_1fr_auto] h-svh max-h-svh">
        <label className="input w-[100%]">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
            type="search"
            value={search}
            placeholder="Buscar (ej. frola)"
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="grid max-w-128 gap-y-4 overflow-auto">
          {sorted.map((p) => (
            <Row key={p.id} product={p} />
          ))}
          {rest.map((p) => (
            <Row key={p.id} product={p} />
          ))}
        </div>
        <button
          type="button"
          disabled={total === 0}
          className="btn btn-success"
          onClick={() => dialog.current?.showModal()}
        >
          Encargar
        </button>
      </div>
    </>
  );
}
