import "./App.css";
import Registration from "./Pages/Registration";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import OTPconformationPage from "./Pages/OTPconformationPage";
import Login from "./Pages/Login";
import HomePage from "./Pages/HomePage";
import DashboardLayout from "./Pages/User/DashboardLayout";
import PrivateTasksPage from "./Pages/User/PrivateTasksPage";
import AssignedTasksPage from "./Pages/User/AssignedTasksPage";
import MyTeamsPage from "./Pages/User/MyTeamsPage";
import TeamDetailsPage from "./Pages/User/TeamDetailsPage";
import FindTeamsPage from "./Pages/User/FindTeamsPage";
import AiChatPage from "./Pages/User/AiChatPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {

  


  return (

    // <PrivatePage/>
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/AccountRegistration" element={<Registration />} />
        <Route path="/AccountLogin" element={<Login />} />
        <Route path="/OTPconformation" element={<OTPconformationPage />} />

        <Route path="/dishboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="private" replace />} />
          <Route path="private" element={<PrivateTasksPage />} />
          <Route path="assigned" element={<AssignedTasksPage />} />
          <Route path="teams" element={<MyTeamsPage />} />
          <Route path="teams/:teamId" element={<TeamDetailsPage />} />
          <Route path="find-teams" element={<FindTeamsPage />} />
          <Route path="ai" element={<AiChatPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
