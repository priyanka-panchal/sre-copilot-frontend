import React from "react";
import "./styles.css"; 
import eInfoLogo from "../../assets/e_info.png";

const Header = () => {

  return (
    <header className="header">
      <nav className="navbar">
        <div>
          <ul className="nav-list">
            <li className="nav-item">
              <div className="sidebar-header">
                <h2>SRE-Copilot</h2>
              </div>
            </li>
          </ul>
        </div>
        <ul className="nav-list">
            <li className="nav-item">
              <img
                src={eInfoLogo}
                alt="eInfochips Logo"
                className="logo-image"
              />
            </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
