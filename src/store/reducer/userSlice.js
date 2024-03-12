import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action) => {
      console.log(action.payload);
      state.userId = action.payload;
    },
    removeUserId: (state, action) => {
      state.userId = null
    }
  },
});

export const { setUserId ,removeUserId} = userSlice.actions;
export const selectUserId = (state) => state.user.userId;

export default userSlice.reducer;