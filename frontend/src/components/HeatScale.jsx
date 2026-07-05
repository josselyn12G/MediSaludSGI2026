import { VALOR_HEAT, anclaDimension } from "../data/metodologia";

// Escala de calor 1→5 con anclas económicas; resalta el valor seleccionado.
export default function HeatScale({ dimKey, value }) {
  return (
    <div className="mt-2 grid grid-cols-5 gap-1">
      {[1, 2, 3, 4, 5].map((v) => {
        const active = v === value;
        const heat = VALOR_HEAT[v];
        return (
          <div
            key={v}
            className={`rounded-md px-1 py-1 text-center transition-all duration-300 ${
              active
                ? `${heat.bg} scale-105 text-white shadow-md ring-2 ring-offset-1 ring-${v === 5 ? "red" : "brand"}-300`
                : `${heat.soft} ${heat.text} opacity-70`
            }`}
          >
            <p className="text-[10px] font-black">{v}</p>
            <p className="text-[8px] leading-tight">{anclaDimension(dimKey, v)}</p>
          </div>
        );
      })}
    </div>
  );
}
