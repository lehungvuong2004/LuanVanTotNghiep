import { Outlet } from "react-router-dom"
export const MainLayout =  () => (
  <div className="main-layout">

    <div className="">

    </div>
    <div className="page-content">
      <Outlet/>
    </div>
    <div className="">
      
    </div>
  </div>
)