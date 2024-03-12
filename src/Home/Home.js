import React, { useState } from 'react';
import Header from './Header/Header';
import Chat from './Chat/Chat';
import './style.css';
import SideComponent from './sidebar/Sidebar';
import ToggleButton from './toggleButton/ToggleButton';

const Home = () => {
  const [conversationId, setConversationId] = useState(null);
  const [sideComponentVisible, setSideComponentVisible] = useState(true);

  const toggleSideComponent = () => {
    setSideComponentVisible(!sideComponentVisible);
  };

  return (
    <div className="home-container">
      <div className="main-content">
        <div className="toggle-container">
          <ToggleButton className="toggle-button" onClick={toggleSideComponent} />
        </div> 
        <div className={`side-componet ${sideComponentVisible ? 'visible' : ''}`}>
          <SideComponent
            setConversationId={setConversationId}
            sideComponentVisible={sideComponentVisible}
          />
        </div>
        <div className='header-chat'>
          <Header />
          <Chat conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
};

export default Home;
