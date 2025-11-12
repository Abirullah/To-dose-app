import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AiFeatures from "./AiFeature";
import Header from "../../Components/Header";

const menuItems = [
  { key: "todo", label: "Works To Do" },
  { key: "process", label: "Under Process" },
  { key: "completed", label: "Completed Works" },
  { key: "missed", label: "Missed Works" },
];

function UserDishBoard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState("todo");
  const [userProfile, setUserProfile] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/AccountLogin");
    } else {
      //get user profile data
      const userId = localStorage.getItem("userId");
      fetch(`http://localhost:5000/users/GetUserProfile/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userId");
            navigate("/AccountLogin");
          }
          return res.json(res.error);
        })
        .then((data) => {
          setUserProfile(data.user);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
      

    }
  }, [navigate]);

  const renderContent = () => {
    switch (selected) {
      case "todo":
        return (
          <div className="p-6 justify-center items-center flex flex-col">

            {/* Replace with your To Do works list */}
            <h2 className="text-xl font-bold mb-4">Works To Do</h2>
            <p className="justify-center ">List of tasks to do...</p>
          </div>
        );
      case "process":
        return (
          <div className="p-6 justify-center items-center flex flex-col">
            <h2 className="text-xl font-bold mb-4">Under Process</h2>
            <p>List of tasks in process...</p>
          </div>
        );
      case "completed":
        return (
          <div className="p-6 justify-center items-center flex flex-col">
            <h2 className="text-xl font-bold mb-4">Completed Works</h2>
            <p>List of completed tasks...</p>
          </div>
        );
      case "missed":
        return (
          <div className="p-6 justify-center items-center flex flex-col">
            <h2 className="text-xl font-bold mb-4">Missed Works</h2>
            <p>List of missed tasks...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="flex bg-gray-50">
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
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>

        <div className="flex w-full h-full  ">
          <AiFeatures />
        </div>
      </div>
    </div>
  );
}

export default UserDishBoard;
