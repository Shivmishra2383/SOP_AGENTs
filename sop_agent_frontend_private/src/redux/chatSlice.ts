import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import API from "@/lib/api";

export interface ChatSource {
  sopId: string;
  title: string;
  fileName: string;
  pageNumber: number | null;
  chunkIndex: number | null;
  score: number;
  excerpt: string;
  citation: string;
}

export interface ChatMessage {
  type: "q" | "a";
  text: string;
  sources?: ChatSource[];
}

export interface ChatSession {
  _id: string;
  title: string;
  sopId: string | null;
  sopTitle?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    role: "user" | "assistant";
    text: string;
    sources?: ChatSource[];
  }>;
}

export const askQuestion = createAsyncThunk(
  "chat/ask",
  async (
    query: { question: string; sopId?: string | null; sessionId?: string | null },
    thunkAPI
  ) => {
    try {
      const res = await API.post("/chat/ask", query);

      return {
        question: query.question,
        answer: res.data.answer || "I don't know based on the uploaded SOPs.",
        sessionId: res.data.sessionId as string,
        sources: (res.data.sources || []) as ChatSource[]
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong while connecting to the AI engine."
      );
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  "chat/history",
  async (_, thunkAPI) => {
    try {
      const res = await API.get("/chat/history");
      return res.data as ChatSession[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat history."
      );
    }
  }
);

export const deleteChatSession = createAsyncThunk(
  "chat/deleteSession",
  async (sessionId: string, thunkAPI) => {
    try {
      await API.delete(`/chat/history/${sessionId}`);
      return sessionId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete chat session."
      );
    }
  }
);

type ChatState = {
  messages: ChatMessage[];
  sessions: ChatSession[];
  activeSessionId: string | null;
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
};

const initialState: ChatState = {
  messages: [],
  sessions: [],
  activeSessionId: null,
  loading: false,
  historyLoading: false,
  error: null
};

function mapSessionMessages(messages: ChatSession["messages"]): ChatMessage[] {
  return messages.map((message) => ({
    type: message.role === "user" ? "q" : "a",
    text: message.text,
    sources: message.sources || []
  }));
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat: (state) => {
      state.messages = [];
      state.activeSessionId = null;
      state.error = null;
    },
    selectSession: (state, action: PayloadAction<string | null>) => {
      state.activeSessionId = action.payload;
      const session = state.sessions.find((item) => item._id === action.payload);
      state.messages = session ? mapSessionMessages(session.messages) : [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.sessions = action.payload;

        if (state.activeSessionId) {
          const active = action.payload.find((session) => session._id === state.activeSessionId);
          if (active) {
            state.messages = mapSessionMessages(active.messages);
          }
        }
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteChatSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((session) => session._id !== action.payload);

        if (state.activeSessionId === action.payload) {
          state.activeSessionId = null;
          state.messages = [];
        }
      })
      .addCase(deleteChatSession.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(askQuestion.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.messages.push({
          type: "q",
          text: action.meta.arg.question
        });
      })
      .addCase(askQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSessionId = action.payload.sessionId;
        state.messages.push({
          type: "a",
          text: action.payload.answer,
          sources: action.payload.sources
        });
      })
      .addCase(askQuestion.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = (action.payload as string) || "Error getting response";
        state.error = errorMessage;
        state.messages.push({
          type: "a",
          text: errorMessage
        });
      });
  }
});

export const { clearChat, selectSession } = chatSlice.actions;
export default chatSlice.reducer;
