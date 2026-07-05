import { nivelRR } from "../data/metodologia";

const NIVEL_CELL = {
  "Crítico": "bg-red-500 text-white",
  "Alto": "bg-orange-400 text-white",
  "Medio": "bg-yellow-300 text-yellow-900",
  "Bajo": "bg-green-400 text-green-900",
};

const TEF = { 5: ">52/año", 4: "1–12/año", 3: "0.1–1/año", 2: "0.01–0.1/año", 1: "<0.01/año" };

// Mapa de calor 5×5 (§4.4.2): RR = P × I. Resalta opcionalmente una celda.
export default function HeatMap5x5({ highlight }) {
  return (
    <div>
      <div className="flex">
        <div className="flex w-10 items-center justify-center">
          <span className="rotate-180 text-[10px] font-bold uppercase tracking-wider text-slate-400 [writing-mode:vertical-rl]">
            Probabilidad (P)
          </span>
        </div>
        <div className="flex-1">
          <table className="w-full border-separate border-spacing-1 text-center">
            <tbody>
              {[5, 4, 3, 2, 1].map((p) => (
                <tr key={p}>
                  <td className="w-16 text-right text-[10px] text-slate-400">
                    <div className="font-bold text-slate-600">P={p}</div>
                    {TEF[p]}
                  </td>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const rr = p * i;
                    const nivel = nivelRR(rr);
                    const isHi = highlight && highlight.p === p && highlight.i === i;
                    return (
                      <td key={i} className="p-0">
                        <div
                          className={`relative grid h-12 place-items-center rounded-md text-sm font-black transition ${NIVEL_CELL[nivel]} ${
                            isHi ? "scale-110 ring-4 ring-brand-900 shadow-lg" : "opacity-90"
                          }`}
                        >
                          {rr}
                          {isHi && (
                            <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand-900 text-[8px] text-white">
                              ★
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td></td>
                {[1, 2, 3, 4, 5].map((i) => (
                  <td key={i} className="pt-1 text-[10px] font-bold text-slate-600">I={i}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="mt-1 text-center text-[10px] uppercase tracking-wider text-slate-400">
            Impacto (I = máx C, I, D)
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px]">
        {[["Crítico", "20–25", "bg-red-500"], ["Alto", "12–19", "bg-orange-400"], ["Medio", "6–11", "bg-yellow-300"], ["Bajo", "1–5", "bg-green-400"]].map(([n, r, c]) => (
          <span key={n} className="flex items-center gap-1">
            <span className={`h-3 w-3 rounded ${c}`} /> <b>{n}</b> ({r})
          </span>
        ))}
      </div>
    </div>
  );
}
