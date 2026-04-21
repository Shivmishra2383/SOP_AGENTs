import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/lib/api";

export const getAllSOPs = createAsyncThunk(
  "sop/getAll",
  async (_, thunkAPI) => {
    try {
      const res = await API.get("/sop");
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch SOPs");
    }
  }
);

export const uploadSOP = createAsyncThunk(
  "sop/upload",
  async ({ file, title }: any, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      
      const res = await API.post("/sop/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.sop;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const deleteSOP = createAsyncThunk(
  "sop/delete",
  async (id: string, thunkAPI) => {
    try {
      await API.delete(`/sop/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Deletion failed");
    }
  }
);

const sopSlice = createSlice({
  name: "sop",
  initialState: {
    items: [] as any[],
    loading: false,
    uploadLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSOPs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSOPs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAllSOPs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSOP.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSOP.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (sop) => (sop._id || sop.id) !== action.payload
        );
      })
      .addCase(deleteSOP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadSOP.pending, (state) => {
        state.uploadLoading = true;
      })
      .addCase(uploadSOP.fulfilled, (state, action) => {
        state.uploadLoading = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(uploadSOP.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default sopSlice.reducer;
