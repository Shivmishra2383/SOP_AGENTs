
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sopReducer from "./sopSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sop: sopReducer,
    chat: chatReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
