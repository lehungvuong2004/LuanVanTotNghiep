import { Route, Routes, BrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Errors } from "../components/Errors";
import { Contact } from "../pages/Contact";
import { LoginLayout } from "../layouts/LoginLayout";
import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/lien-he" element={<Contact />} />
        </Route>

        <Route element={<LoginLayout />}>
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
        </Route>
        <Route path="*" element={<Errors />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
