import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TVMIN from "./components/TVMIN";
import Adm from "./components/Adm";
import Enlaces from "./components/Enlaces";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/adm" element={<Adm />} />
        <Route path="/tvmin" element={<TVMIN />} />
        <Route path="/enlaces" element={<Enlaces />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;