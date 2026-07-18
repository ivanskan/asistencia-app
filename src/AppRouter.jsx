import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TVMIN from "./components/TVMIN";
import Adm from "./components/Adm";
import Asistencia from "./AsistenciaV2";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/adm" element={<Adm />} />
        <Route path="/tvmin" element={<TVMIN />} />
        <Route path="/asistencia" element={<Asistencia />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;