import { Route, Routes, BrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout/MainLayout";
import { Errors } from "../components/Errors";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<div>Home</div>} />
        </Route>
        <Route path="*" element={<Errors />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
