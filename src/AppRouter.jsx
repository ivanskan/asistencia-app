import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TV from "./components/TV"; // 👈 ajusta si está en otra ruta

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tv" element={<TV />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;