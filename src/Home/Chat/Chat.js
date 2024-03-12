import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  faUser,
  faPaperPlane,
  faThumbsUp,
  faThumbsDown,
  faCommentDots,
} from "@fortawesome/free-regular-svg-icons";
import "./Chat.css";

import {
  addMessage,
  addReferenceDocuments,
  removeMessge,
  selectMessages,
  setFirstQuestionAsked,
  updateFeedback,
} from "../../store/reducer/chatSlice";
import { selectUserId } from "../../store/reducer/userSlice";
import { REACT_APP_API_ENDPOINT } from "../../environment/env";
import AuthService from "../../services/authService";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Document, Page } from "@react-pdf/renderer";

const Chat = ({ conversationId }) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const userId = useSelector(selectUserId);
  const [inputMessage, setInputMessage] = useState("");
  const [messagePosition, setMessagePosition] = useState({ left: 0, top: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [sourceDocuments, setSourceDocuments] = useState([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [originalSourceDocuments, setOriginalSourceDocuments] = useState([]);
  const [isDocumentSelected, setIsDocumentSelected] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [conversationIdFromData, setConversationIdFromData] = useState(null); // Define conversationIdFromData state variable
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [characterLimit] = useState(5000);
  const textareaRef = useRef(null);
  // Define a ref for storing filename and message ID list
  const fileInfoListRef = useRef([]);
  const botResponseCount = messages.filter(
    (message) => message.sender === "bot"
  ).length;
  console.log("messages", messages);

  useEffect(() => {
    // Scroll to the bottom of the message container when messages change
    const messageContainer = document.querySelector(".message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [isTyping]);
  // Example function to check if content exists
  useEffect(() => {
    const documentContainer = document.querySelector(".document-container");
    if (documentContainer) {
      const contentExists = documentContainer.children.length > 0;
      setHasContent(contentExists);
    }
  }, [sourceDocuments]);

  useEffect(() => {
    setSelectedSource(""); // Reset selectedSource when conversationId changes
    setHasContent(false);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      dispatch(removeMessge());
      fetchConversationMessages();
    } else {
      dispatch(addMessage({ text: "Loading chat.........", sender: "bot" }));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    // Resize the textarea when inputMessage changes
    resizeTextarea();
  }, [inputMessage]);

  const fetchConversationMessages = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(
        REACT_APP_API_ENDPOINT +
          `/api/v1/conversations/?conversation_id=${conversationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("response ok", response);
        const data = await response.json();
        const conversationMessages = data.messages;
        conversationMessages.forEach((message) => {
          console.log(
            message.id,
            message.response_feedback,
            message.file_names
          );
          // Set the sender based on the role in the message
          const sender = message.role === "human" ? "user" : "bot";
          dispatch(
            addMessage({
              text: message.content,
              sender,
              messageId: message.id,
              feedback: message.response_feedback,
              fileNames: message.file_names,
            })
          );
        });
        if (data.source_documents) {
          setSourceDocuments(data.source_documents);
          // setOriginalSourceDocuments(data.source_documents);
        }
        fileInfoListRef.current = [];
      } else {
        console.error(
          "Failed to fetch conversation messages:",
          response.statusText
        );
        // Handle error if needed
      }
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      // Handle error if needed
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      dispatch(addMessage({ text: inputMessage, sender: "user" }));
      setIsTyping(true);
      try {
        const token = AuthService.getToken();
        const response = await fetch(
          REACT_APP_API_ENDPOINT +
            `/api/v1/poc_1s/${conversationId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ input: inputMessage }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const botResponse = data.answer; // Access the openapi_response field
          const conversationIdFrom_Data = data.conversation_id;
          setConversationIdFromData(conversationIdFrom_Data);
          const messageId = data.message_id; // Get the message ID from the latest response
          setSelectedMessageId(messageId); // Set the message ID
          dispatch(
            addMessage({
              text: botResponse,
              sender: "bot",
              messageId: messageId,
            })
          ); // Add bot response with message ID
          dispatch(setFirstQuestionAsked(true));

          if (data.source_documents) {
            setSourceDocuments(data.source_documents);
            const fileNames = data.source_documents.map(
              (source) => source.metadata.source.file_name
            );
            setOriginalSourceDocuments(fileNames);
            if (fileNames != "") {
              const fileInfo = { messageId: data.message_id, fileNames };
              fileInfoListRef.current.push(fileInfo);
              console.log("Updated File Info List:", fileInfoListRef.current);
            }

            setIsDocumentSelected(false);
          }
        } else {
          const errorMessage = await response.json(); // Get error message from backend
          toast.info(errorMessage.message);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Handle error if needed
      } finally {
        setIsTyping(false); // Remove typing indicator after response
        setInputMessage("");
      }
    }
  };

  const sendFeedback = async (feedback, messageId) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(
        REACT_APP_API_ENDPOINT + `/api/v1/conversations/${messageId}/feedback`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback }),
        }
      );

      if (!response.ok) {
        console.error("Failed to send feedback:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  // Modify the handleFeedback function to use message ID
  const handleFeedback = async (feedback, messageId) => {
    console.log("handle feedback");
    if (feedback && messageId) {
      console.log(feedback, messageId);
      try {
        await sendFeedback(feedback, messageId);
        dispatch(updateFeedback({ messageId, feedback })); // Dispatch action to update feedback in Redux store
        console.log(
          `Feedback '${feedback}' sent for message ID '${messageId}'.`
        );
      } catch (error) {
        console.error("Error sending feedback:", error);
      }
    } else {
      console.error("Feedback or message ID is missing.");
    }
  };

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height to auto to recalculate the scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to match the scrollHeight
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default Enter behavior
      handleSendMessage();
      setInputMessage("");
    } else if (e.key === "Enter" && e.shiftKey) {
      // Move to the next line when Shift + Enter is pressed
      setInputMessage((prevMessage) => prevMessage + "\n");
    } else if (e.key === "Backspace" || e.key === "Delete") {
      // Allow backspace and delete keys even if the character limit is reached
      return;
    }

    const lines = inputMessage.split("\n");
    const currentLine = lines[lines.length - 1];

    // Check if the current line length exceeds 80 characters and insert a new line
    if (currentLine.length >= 80) {
      setInputMessage(inputMessage + "\n");
    }

    // Check if the total message length exceeds the character limit
    if (
      inputMessage.length >= characterLimit &&
      e.key !== "Backspace" &&
      e.key !== "Delete"
    ) {
      e.preventDefault(); // Prevent further input
    }
  };

  // const positionMessageDisplay = (event) => {
  //   const messageDisplay = event.target.nextElementSibling;
  //   if (messageDisplay) {
  //     // Update the message display position to match the mouse pointer
  //     setMessagePosition({ left: event.clientX, top: event.clientY });
  //     messageDisplay.style.left = `${messagePosition.left}px`;
  //     messageDisplay.style.top = `${messagePosition.top}px`;
  //   }
  // };

  const handleSourceChange = async (source) => {
    setSelectedSource(source);
    if (source === "") {
      setSourceDocuments(originalSourceDocuments);
      setIsDocumentSelected(false);
    } else {
      try {
        const token = AuthService.getToken();
        const response = await fetch(
          `${REACT_APP_API_ENDPOINT}/api/v1/sendfile/get/${source}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/pdf",
            },
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          // Instead of opening in new tab, set the content to render within document container
          setSourceDocuments([{ url: url }]);
          console.log(url);
          setIsDocumentSelected(true);
        } else {
          console.error("Failed to fetch PDF:", response.statusText);
          // Handle error if needed
        }
      } catch (error) {
        console.error("Error fetching PDF:", error);
        // Handle error if needed
      }
    }
  };

  const handleClearInputText = () => {
    setInputMessage("");
  };
  const clearDocumentContent = () => {
    setSelectedSource("");
    setIsDocumentSelected(false);
  };
  const handleInput = (e) => {
    let { value } = e.target;
    if (value.length > characterLimit) {
      // Display toast message when character limit is exceeded
      toast.info("Character limit exceeded. Limit is 5000 characters.");
      value = value.substring(0, characterLimit); // Truncate input message
    }
    setInputMessage(value);

    // Update textarea value to show only first 5000 characters
    textareaRef.current.value = value.substring(0, characterLimit);
  };

  console.log(messages);

  return (
    <div className="chat-document-container">
      <ToastContainer />
      <div className="chat-container">
        <div className="message-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <FontAwesomeIcon
                icon={message.sender === "user" ? faUser : faCommentDots}
                className="icon"
              />
              <div className="text">
                {message.text.split("```").map((section, idx) => {
                  return idx % 2 === 0 ? (
                    <span key={idx}>{section}</span>
                  ) : (
                    <div className="code-snippet">
                      <span key={idx} className="code-snippet-1">
                        {section}
                      </span>
                    </div>
                  );
                })}

                {message.fileNames && (
                  <div className="source-documents">
                    <p>Reference Documents:</p>
                    <ol className="document-list">
                      {message.fileNames.split(",").map((fileName, index) => (
                        <li key={index}>
                          <a
                            href="#"
                            onClick={() => handleSourceChange(fileName)}
                          >
                            {fileName}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {fileInfoListRef.current.map((fileInfo) => {
                  if (fileInfo.messageId === message.messageId) {
                    return (
                      <div
                        className="source-documents"
                        key={fileInfo.messageId}
                      >
                        <p>Reference Documents:</p>
                        <ol className="document-list">
                          {fileInfo.fileNames.map((fileName, index) => (
                            <li key={index}>
                              <a
                                href="#"
                                onClick={() => handleSourceChange(fileName)}
                              >
                                {fileName}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  }
                  return null;
                })}
                {message.sender === "bot" && (
                  <div className="bot-icons">
                    <FontAwesomeIcon
                      icon={faThumbsUp}
                      className={`thumbs-up ${
                        message.feedback === "good" ? "green-animation" : ""
                      }`}
                      onClick={() => handleFeedback("good", message.messageId)}
                    />
                    {/* <div className="message-display">Good response</div> */}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <FontAwesomeIcon
                      icon={faThumbsDown}
                      className={`thumbs-down ${
                        message.feedback === "bad" ? "red-animation" : ""
                      }`}
                      onClick={() => handleFeedback("bad", message.messageId)}
                    />
                    <div className="bot-response-counter">
                      {(index + 1) / 2}/{5}
                    </div>
                    {/* <div className="message-display">Bad response</div> */}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="">
            {isTyping && (
              <FontAwesomeIcon icon={faSpinner} className="typing-indicator" />
            )}
          </div>
        </div>
        <div className="input-container">
          <textarea
            ref={textareaRef} // Set the ref for the textarea element
            className="textarea-autoresize" // Apply the autoresize class
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Type a message..."
            rows={1} // Set initial number of rows
            maxRows={8}
            style={{ resize: "none" }} // Disable resizing of textarea
            disabled={isTyping}
          />
          <div className="character-limit">
            {inputMessage.length}/{characterLimit}
          </div>
          <button
            className="input-button"
            onClick={() => {
              handleSendMessage();
              handleClearInputText();
            }}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
      {isDocumentSelected && (
        <div
          className={`document-container ${
            hasContent ? "has-content" : "no-content"
          }`}
        >
          <button
            className="clear-document-button"
            onClick={clearDocumentContent}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          {sourceDocuments.map((document, index) => (
            <div key={index} className="document">
              {document.url && (
                <iframe
                  src={document.url}
                  title="PDF Viewer"
                  className="pdf-viewer"
                ></iframe>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;
