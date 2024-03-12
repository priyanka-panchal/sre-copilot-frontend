import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: JSON.parse(localStorage.getItem('chatMessages')) || [],
  isFirstQuestionAsked: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
     state.questionTopic = action.payload.text;
     // localStorage.setItem('chatMessages', JSON.stringify(state.messages));
    },
    removeMessge: (state, action) => {
      state.messages=[]
      //localStorage.removeItem('chatMessages');
    },
    setFirstQuestionAsked: (state,action) => {
      state.isFirstQuestionAsked = action.payload;
    },
    updateFeedback: (state, action) => {
      const { messageId, feedback } = action.payload;
      const messageToUpdate = state.messages.find(message => message.messageId === messageId);
      if (messageToUpdate) {
        messageToUpdate.feedback = feedback;
      }
    },
  },
});

export const { addMessage,removeMessge,setFirstQuestionAsked ,updateFeedback} = chatSlice.actions;
export const selectIsFirstQuestionAsked = (state) => state.chat.isFirstQuestionAsked;
export const selectMessages = (state) => state.chat.messages;

export default chatSlice.reducer;