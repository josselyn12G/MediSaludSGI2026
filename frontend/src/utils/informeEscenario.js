import { consultarIA } from "../api/resources";
import { formatUSD } from "../data/metodologia";

// Genera un resumen IA breve del escenario y abre una ventana imprimible (PDF).
export async function exportarInformeEscenario(e, orgNombre = "Medisalud Integral S.A.") {
  const payload = {
    escenario: `${e.amenaza_codigo}×${e.vulnerabilidad_codigo}`,
    activo: `${e.activo_codigo} ${e.activo_nombre}`,
    amenaza: e.amenaza_nombre, vulnerabilidad: e.vulnerabilidad_nombre,
    nivel: e.nivel, RR: e.rr_simple, ALE_PERT: formatUSD(e.ale_pert_usd), ALE_P90: formatUSD(e.ale_p90_usd),
    estrategia: e.estrategia_tratamiento || "no definida",
  };
  const r = await consultarIA("resumen_escenario", payload);
  const texto = (r.respuesta || "").trim();
  const fila = (l, v) => `<tr><td style="padding:4px 8px;color:#64748b">${l}</td><td style="padding:4px 8px;font-weight:600">${v ?? "—"}</td></tr>`;
  const w = window.open("", "_blank", "width=820,height=920");
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe ${e.codigo || e.id}</title>
  <style>body{font-family:Inter,system-ui,Arial,sans-serif;color:#0f172a;margin:40px;}
  h1{color:#991b1b;font-size:20px;margin:0} .sub{color:#64748b;font-size:12px;margin:2px 0 16px}
  .bar{border-top:3px solid #b62525;margin:14px 0} table{border-collapse:collapse;font-size:13px;width:100%}
  .narr{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:13px;line-height:1.6;white-space:pre-wrap}
  .foot{color:#94a3b8;font-size:10px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:8px}</style></head>
  <body>
  <p style="color:#b62525;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0">Informe ejecutivo de escenario</p>
  <h1>${orgNombre}</h1>
  <p class="sub">${new Date().toLocaleDateString("es-EC")} · Escenario ${e.amenaza_codigo}×${e.vulnerabilidad_codigo} · Nivel ${(e.nivel || "").toUpperCase()}</p>
  <div class="bar"></div>
  <h3 style="margin:0 0 6px">Resumen ejecutivo</h3>
  <div class="narr">${texto.replace(/</g, "&lt;")}</div>
  <h3 style="margin:18px 0 6px">Datos del escenario</h3>
  <table>
    ${fila("Activo", `${e.activo_codigo} · ${e.activo_nombre}`)}
    ${fila("Amenaza", `${e.amenaza_codigo} · ${e.amenaza_nombre}`)}
    ${fila("Vulnerabilidad", `${e.vulnerabilidad_codigo} · ${e.vulnerabilidad_nombre}`)}
    ${fila("RI / RR / RR_simple", `${e.ri} / ${e.rr} / ${e.rr_simple}`)}
    ${fila("ALE_PERT / P90 / P95", `${formatUSD(e.ale_pert_usd)} / ${formatUSD(e.ale_p90_usd)} / ${formatUSD(e.ale_p95_usd)}`)}
    ${fila("Estrategia de tratamiento", e.estrategia_tratamiento || "—")}
    ${fila("Creado por", e.creado_por_email || "—")}
  </table>
  <p class="foot">ISO/IEC 27005:2022 · MAGERIT v3.0 · FAIR · Monte Carlo · LOPDP Ecuador · GRM Medisalud</p>
  </body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 400);
}
