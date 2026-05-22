import { Route, Routes, BrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout/MainLayout";
import { Errors } from "../components/Errors";
import { Contact } from "../pages/Contact";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* <Route index element={<diviv>Home</diviv>} /> */}
          <Route path="/lien-he" element={<Contact />} />
        </Route>
        <Route path="*" element={<Errors />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
