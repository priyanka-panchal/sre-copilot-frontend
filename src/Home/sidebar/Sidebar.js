import React, { useState, useEffect } from "react";
import "./Styles.css";
import { REACT_APP_API_ENDPOINT } from "../../environment/env";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faHistory,
  faPlus,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faMessage, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import AuthService from "../../services/authService";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  removeMessge,
  setFirstQuestionAsked,
} from "../../store/reducer/chatSlice";
import { setUserId, removeUserId } from "../../store/reducer/userSlice";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SideComponent = ({ setConversationId }) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();
  const [showSignOut, setShowSignOut] = useState(false);
  const fleg = useSelector((state) => state.chat.isFirstQuestionAsked);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1); // Current page number
  const [limit, setLimit] = useState(5); // Number of conversations per page
  const [hasReached25Conversations, setHasReached25Conversations] = useState(false);
  

  const handleNewConversation = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(
        REACT_APP_API_ENDPOINT + "/api/v1/conversations/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      // Update conversation history after creating a new conversation
      setConversationHistory([...conversationHistory, data]);
      // Pass the new conversation ID to the parent component (Home)
      setConversationId(data.id);
      // Store the conversation ID in local storage
      localStorage.setItem("conversationId", data.id);
      // Move to page 1 with a limit of 5
      setPage(1);
      setLimit(5);
      fetchConversationHistory();
      console.log(data.id);
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Handle error
    }
  };

  const fetchConversationHistory = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(
        REACT_APP_API_ENDPOINT +
          "/api/v1/conversations/list?page=" +
          page +
          "&limit=" +
          limit,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);
      if(data.length === 0) {
        handleNewConversation();
      }
      // Ensure the fetched data is an array before setting it
      if (Array.isArray(data)) {
        setConversationHistory(data);
        // Retrieve conversation ID from local storage
        const storedConversationId = localStorage.getItem("conversationId");
        // Set conversation ID to the stored one if available
        if (storedConversationId) {
          setConversationId(storedConversationId);
        } else if (data.length > 0) {
          // If no conversation ID is stored, set it to the last conversation
          setConversationId(data[data.length - 1].id);
        }
      } else {
        console.error("Fetched data is not an array:", data);
      }
      if (data.length == 25 && !hasReached25Conversations){
        setHasReached25Conversations(true);
        toast.info("You've reached 25 conversations!");
      }
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      // Handle error
    }
  };
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = AuthService.getToken();
        if (token) {
          const response = await axios.get(
            REACT_APP_API_ENDPOINT + "/api/v1/auth/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(response.data);
          dispatch(setUserId(response.data.user_id));
        }
      } catch (error) {
        console.error(error.response.data);
      }
    };

    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, []);
  useEffect(() => {
    fetchConversationHistory();
  }, [page, limit, fleg]);

  if (fleg) {
    dispatch(setFirstQuestionAsked(false));
  }

  const handleSelectConversation = (conversationId) => {
    // Set conversation ID to the selected conversation
    setConversationId(conversationId);
    // Store the conversation ID in local storage
    localStorage.setItem("conversationId", conversationId);
  };

  const renderContent = (conversation) => {
    // Check if the messages array is not empty
    if (conversation.messages && conversation.messages.length > 0) {
      // Check if the first message has content
      if (conversation.messages[0].content) {
        return conversation.messages[0].content;
      }
    }
    // If no content found, return the conversation ID
    return "New Chat...";
  };
  const deleteConversation = async (conversationId) => {
    try {
      const token = AuthService.getToken();
      await fetch(
        REACT_APP_API_ENDPOINT + `/api/v1/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Fetch updated conversation history after deletion
      fetchConversationHistory();
  
      const storedConversationId = localStorage.getItem("conversationId");
  
      // Only change the selected conversation if the deleted conversation was the current one
      if (conversationId === storedConversationId) {
        var updatedConversationHistory = conversationHistory.filter(
          (conversation) => conversation.id !== conversationId
        );
        setConversationHistory(updatedConversationHistory);
  
        if (updatedConversationHistory.length > 0) {
          // If there are conversations left after the deleted one, select the first one
          const nextConversationId = updatedConversationHistory[0].id;
          setConversationId(nextConversationId);
          localStorage.setItem("conversationId", nextConversationId);
          console.log(page);
        } else {
          // If no conversations left
          if (page === 1) {
            // handleNewConversation();
          } else {
           //implemntation 
          }
        }
      }
    //   else {
    //     if (page > 1 && conversationHistory.length == 1) {
    //       setPage(page - 1);
    //       console.log(page);
    //   }
    // }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };
  

  const handleExportToWord = async (conversationId) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(
        REACT_APP_API_ENDPOINT +
          `/api/v1/conversations/export/${conversationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response is successful (status code 200)
      if (response.ok) {
        // Convert the response to a blob
        const blob = await response.blob();

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([blob]));

        // Create a temporary <a> element to trigger the download
        const link = document.createElement("a");
        link.href = url;

        // Set the filename for the download
        link.setAttribute("download", `conversation_${conversationId}.docx`);

        // Append the <a> element to the document body and trigger the click event
        document.body.appendChild(link);
        link.click();

        // Cleanup: remove the <a> element and revoke the URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Export failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error exporting conversation to Word:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post(REACT_APP_API_ENDPOINT + "/api/v1/auth/signout");
      AuthService.removeToken();
      dispatch(removeMessge());
      dispatch(removeUserId());
      setUser(null); // Clear user information
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error.response.data);
      // Handle error if needed
    }
  };

  const handleSeeMore = () => {
    setPage(1);
    setLimit(limit + 5)
  };

  // Function to handle "See Less" button click
  const handleSeeLess = () => {
      setPage(1);
      setLimit(5)
  };
  
  return (
    <div className="side-component">
       <ToastContainer />
      <div className="menu">
        <ul>
          <div className="menu_child">
            <li onClick={handleNewConversation}>
              <NavLink>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;&nbsp;
                <span>New Conversation</span>
              </NavLink>
            </li>
            <li>
              <NavLink>
                <FontAwesomeIcon icon={faHistory} />
                &nbsp;&nbsp;
                <span>History</span>
              </NavLink>
            </li>
          </div>
          <div className="history-container">
          {conversationHistory.map((conversation) => (
            <li className="list-conversation" key={conversation.id}>
      
              <NavLink 
                onClick={() => handleSelectConversation(conversation.id)}
              >
                 <div className="conversation-history">
                <div>
                  <FontAwesomeIcon icon={faMessage} className="message-icon" />
                  &nbsp;&nbsp;
                  {renderContent(conversation).substring(0, 13)}..
                </div>
                </div>
              </NavLink>
      
              <div className="button-container">
                <FontAwesomeIcon
                  icon={faDownload}
                  className="export-icon"
                  onClick={() => handleExportToWord(conversation.id)}
                />
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  className="delete-icon"
                  onClick={() => deleteConversation(conversation.id)}
                />
              </div>
            </li>
          ))}
          </div>
        </ul>
      </div>
      <div className="pagination">
        {limit > 6 && <button onClick={handleSeeLess}>See Less</button>}
        {conversationHistory.length == limit && limit <= 20 &&(
          <button onClick={handleSeeMore}>See More</button>
        )}
      </div>
      {user && (
        <div className="footer">
          <div className="sidebar-footer">
            <p onClick={() => setShowSignOut(!showSignOut)}>
              {user.firstname} {user.lastname}
            </p>
          </div>
          {showSignOut && (
            <div className="signout-option" onClick={handleSignOut}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Sign Out</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SideComponent;
