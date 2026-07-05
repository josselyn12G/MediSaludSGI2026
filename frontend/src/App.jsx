import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import OrganizacionPage from "./pages/OrganizacionPage";
import ContextoPage from "./pages/contexto/ContextoPage";
import ConfiguracionIAPage from "./pages/ConfiguracionIAPage";
import ActivosListPage from "./pages/activos/ActivosListPage";
import ActivoDetailPage from "./pages/activos/ActivoDetailPage";
import AmenazasPage from "./pages/AmenazasPage";
import AmenazasCatalogoPage from "./pages/catalogos/AmenazasCatalogoPage";
import VulnerabilidadesPage from "./pages/catalogos/VulnerabilidadesPage";
import ControlesPage from "./pages/catalogos/ControlesPage";
import WizardEscenarioPage from "./pages/escenarios/WizardEscenarioPage";
import InformePage from "./pages/InformePage";
import RiesgosPage from "./pages/RiesgosPage";
import TratamientoPage from "./pages/TratamientoPage";
import KpisPage from "./pages/KpisPage";
import MonitoreoPage from "./pages/MonitoreoPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

const Protected = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/organizacion" element={<Protected><OrganizacionPage /></Protected>} />
      <Route path="/contexto" element={<Protected><ContextoPage /></Protected>} />
      <Route path="/activos" element={<Protected><ActivosListPage /></Protected>} />
      <Route path="/activos/:id" element={<Protected><ActivoDetailPage /></Protected>} />
      <Route path="/amenazas" element={<Protected><AmenazasCatalogoPage /></Protected>} />
      <Route path="/vulnerabilidades" element={<Protected><VulnerabilidadesPage /></Protected>} />
      <Route path="/controles" element={<Protected><ControlesPage /></Protected>} />
      <Route path="/amenazas-legacy" element={<Protected><AmenazasPage /></Protected>} />
      <Route path="/escenarios/nuevo" element={<Protected><WizardEscenarioPage /></Protected>} />
      <Route path="/riesgos" element={<Protected><RiesgosPage /></Protected>} />
      <Route path="/tratamiento" element={<Protected><TratamientoPage /></Protected>} />
      <Route path="/monitoreo" element={<Protected><MonitoreoPage /></Protected>} />
      <Route path="/kpis" element={<Protected><KpisPage /></Protected>} />
      <Route path="/informe" element={<Protected><InformePage /></Protected>} />
      <Route path="/configuracion-ia" element={<Protected><ConfiguracionIAPage /></Protected>} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
