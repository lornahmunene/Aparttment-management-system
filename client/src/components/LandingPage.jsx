import React from "react";
import { Link } from "react-router";
import './LandingPage.css'; 

const LandingPage = () => {
  return (
    <div className="landing-container">

    
      <main className="main-content">
        <h1 className="main-title">Apartments Management System</h1>
        <p className="main-description">Modern Living in Peaceful Surroundings</p>

        <Link to="/login" className="cta-button">View Apartments</Link>
      </main>
     
    </div>
  );
};

export default LandingPage;
