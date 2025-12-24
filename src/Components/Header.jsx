import React from "react";
import { useState , useEffect } from "react";


function Header() {
  const [userProfile, setUserProfile] = useState(true);
  const [userProfileState, setUserProfileState] = useState([]);



  const GetDishBord = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/users/verify-token",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            window.location.href = "/dishboard";
            const data = await response.json();
            console.log("Token is valid:", data);

            window.location.href = "/dishboard";
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userId");
            window.location.href = "/AccountLogin";
          }
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      };

      const UserData = async () => {
        const userId = localStorage.getItem("userId");
        try {
          const response = await fetch(
            `http://localhost:5000/users/GetUserProfile/${userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setUserProfileState(data.user);
          } else {
            console.error("Failed to fetch user profile");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }

      };

      UserData();

      verifyToken();
    } else {
      window.location.href = "/AccountLogin";
    }
  };

  

  return userProfile ? (
    <div className="bg-white h-20  bg-opacity-10 backdrop-blur-md shadow-md sticky top-0 z-10 ">
      <div className="container mx-auto px-6  flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800 flex items-center space-x-5 sm:ml-2">
          <img
            className="w-10 h-10"
            src="https://img.freepik.com/premium-vector/todo-app-icon_1076610-59732.jpg"
            alt=""
          />
          TaskMaster
        </div>
        <nav className="flex space-x-6">
          <div>
            <img src="" alt="" className="" />
            <p className=""></p>

          </div>
        </nav>
      </div>
    </div>
  ) : (
    <div className="bg-white bg-opacity-10 h-14 backdrop-blur-md shadow-md sticky top-0 z-10 ">
      <div className="container mx-auto px-6  flex justify-between items-center mt-4">
        <div className="text-2xl font-bold text-gray-800 flex items-center space-x-5 sm:ml-2">
          <img
            className="w-10 h-10"
            src="https://img.freepik.com/premium-vector/todo-app-icon_1076610-59732.jpg"
            alt=""
          />
          TaskMaster
        </div>
        <nav className="flex space-x-6"></nav>
      </div>
    </div>
  );
}

export default Header;
