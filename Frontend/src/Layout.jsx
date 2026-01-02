import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "./pages/Footer";

export default function Layout() {
  return (
    <>
      <div className="py-4 px-8 flex flex-col min-h-screen overflow-scroll scrollbar-hide max-w-6xl mx-auto ">
        <Header />
        <Outlet />
      </div>
      <div className=" ">
        <Footer />
      </div>
    </>
  );
}
