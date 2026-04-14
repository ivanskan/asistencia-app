import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TV from "./components/TV";
import TVMIN from "./components/TVMIN";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tv" element={<TV />} />
        <Route path="/tvmin" element={<TVMIN />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;