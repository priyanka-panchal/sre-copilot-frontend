import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars} from '@fortawesome/free-solid-svg-icons'; // Import faUser icon
import { faUser} from "@fortawesome/free-regular-svg-icons";
import './toggle.css';

const ToggleButton = ({ onClick }) => {
  return (
    <div className='main-container'>
      <button className="toggle-button" onClick={onClick}>
        <div className="icon-container">
          <div className="toggle-icon top-icon">
            <FontAwesomeIcon icon={faBars} />
          </div>
        </div>
      </button>
      <div className="toggle-icon bottom-icon">
        <FontAwesomeIcon icon={faUser} />
      </div>
    </div>
  );
};

export default ToggleButton;
