import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './reducer/chatSlice';
import userReducer from './reducer/userSlice';


export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer
  },
});