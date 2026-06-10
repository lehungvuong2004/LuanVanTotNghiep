import { Route, Routes, BrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Errors404 } from "./components/Errors404";
import { Contact } from "./pages/Contact";
import { LoginLayout } from "./layouts/LoginLayout";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import ForgetPassword from "./pages/ForgetPassword";
import PostAJob from "./pages/PostAJob";
import { Home } from "./pages/Home";
import { Service } from "./pages/Service";
import { Recruitment } from "./pages/Recruitment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/dich-vu" element={<Service />} />
          <Route path="/tuyen-dung" element={<Recruitment />} />
          <Route path="/dang-bai-tuyen" element={<PostAJob />} />
        </Route>
        <Route element={<LoginLayout />}>
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/quen-mat-khau" element={<ForgetPassword />} />
        </Route>
        <Route path="*" element={<Errors404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
