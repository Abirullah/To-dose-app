import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header";
import AiButton from "../../Components/AiButton";
import UnderProcessWork from "./UnderProcessWork";
import PendingWorks from "./PendingWorks";
import CompletedWorks from "./CompletedWorks";
import MissedWorks from "./MissedWorks";


const menuItems = [
  { key: "todo", label: "Works To Do" },
  { key: "process", label: "Under Process" },
  { key: "completed", label: "Completed Works" },
  { key: "missed", label: "Missed Works" },
];

const CurrentPageKey = localStorage.getItem("CurrentPage") || "todo";

function UserDishBoard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(CurrentPageKey);
 

  const navigate = useNavigate();

  localStorage.setItem("CurrentPage", selected);



  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/AccountLogin");
    }
  }, [navigate]);

  const renderContent = () => {
    switch (selected) {
      case "todo":
        return (
          <div className="p-6 justify-center items-center flex flex-col">
            <PendingWorks />            
          </div>
        );
      case "process":
        return (
          <div className="p-6 justify-center items-center flex flex-col w-full">
            <UnderProcessWork />
          </div>
          
        );
      case "completed":
        return (
          <div className="p-6 justify-center items-center flex flex-col">
            <CompletedWorks />
          </div>
        );
      case "missed":
        return (
          <div className="p-6 justify-center items-center flex flex-col">
            <MissedWorks />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <Header />
      <div className="flex bg-gray-50 ">
        {/* Sidebar for large screens */}
        <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg fixed h-[100vh]">
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  selected === item.key
                    ? "bg-blue-500 text-white"
                    : "hover:bg-blue-100"
                }`}
                onClick={() => setSelected(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile menu button */}
        <div className="md:hidden absolute top-4 left-4 z-20 mr-5">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded ${
              menuOpen ? "hidden" : ""
            } bg-blue-500 text-white shadow`}
          >
            ☰
          </button>
        </div>

        {/* Sidebar drawer for small screens */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-blue-400/70 z-10 "
            onClick={() => setMenuOpen(false)}
          >
            <aside
              className="absolute top-0 left-0 w-56 h-full bg-white shadow-lg p-4 "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-bold text-xl mb-4">TaskMaster</div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    className={`w-full text-left px-4 py-2 rounded transition ${
                      selected === item.key
                        ? "bg-blue-500 text-white"
                        : "hover:bg-blue-100"
                    }`}
                    onClick={() => {
                      setSelected(item.key);
                      setMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main dashboard */}
        <main className="flex lg:ml-[15%] overflow-y-auto w-full justify-center items-center 
        ">{renderContent()}</main>
      </div>
      <AiButton />
      
    </div>
  );
}

export default UserDishBoard;
