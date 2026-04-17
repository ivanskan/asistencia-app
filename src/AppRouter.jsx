import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TV from "./components/TV";
import TVMIN from "./components/TVMIN";
import TVBAR from "./components/TVBAR";
import Adm from "./components/Adm";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/adm" element={<Adm />} />
        <Route path="/tv" element={<TV />} />
        <Route path="/tvmin" element={<TVMIN />} />
        <Route path="/tvbar" element={<TVBAR />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;