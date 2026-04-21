import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/lib/api";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: any, thunkAPI) => {
    try {
      const res = await API.post("/auth/login", data);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: any, thunkAPI) => {
    try {
      const res = await API.post("/auth/register", data);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = action.payload ? (typeof window !== "undefined" ? localStorage.getItem("token") : state.token) : null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    clearTokenOnRefresh: (state) => {
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setLoading, logout, clearTokenOnRefresh } = authSlice.actions;
export default authSlice.reducer;
