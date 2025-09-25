import React from 'react'
import './App.css'
import Registration from './Pages/Registration';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import OTPconformationPage from './Pages/OTPconformationPage';
import Login from './Pages/Login';
import HomePage from './Pages/HomePage';
import Header from './Components/Header';


function App() {

  


  return (
    <Router>
      <Header/>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/AccountRegistration' element={<Registration/>}/>
        <Route path='/AccountLogin' element={<Login/>}/>
        <Route path='/OTPConformation' element={<OTPconformationPage/>}/>
      </Routes>
    </Router>
  )
}

export default App
