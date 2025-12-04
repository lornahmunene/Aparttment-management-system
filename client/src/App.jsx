import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import LandingPage from './components/LandingPage'
import Login from './components/LoginPage'
import ManagerDashboard from './components/ManagerDashboard/ManagerDashboard'

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App

