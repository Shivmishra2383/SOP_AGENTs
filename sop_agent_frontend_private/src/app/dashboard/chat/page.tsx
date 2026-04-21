"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { AppDispatch, RootState } from "@/redux/store";
import { askQuestion, clearChat, deleteChatSession, fetchChatHistory, selectSession } from "@/redux/chatSlice";
import { getAllSOPs } from "@/redux/sopSlice";
import { Bot, FileText, History, Loader2, RefreshCcw, Send, Sparkles, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

export default function GlobalChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, loading, sessions, activeSessionId, historyLoading } = useSelector(
    (state: RootState) => state.chat
  );
  const { items: sops } = useSelector((state: RootState) => state.sop);

  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedSopId, setSelectedSopId] = useState<string | null>(searchParams.get("sopId"));

  useEffect(() => {
    dispatch(getAllSOPs());
    dispatch(fetchChatHistory());
  }, [dispatch]);

  useEffect(() => {
    const sopIdFromUrl = searchParams.get("sopId");
    if (sopIdFromUrl) {
      setSelectedSopId(sopIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const selectedSopLabel = useMemo(() => {
    const selected = sops.find((sop) => (sop._id || sop.id) === selectedSopId);
    return selected?.title || "All SOPs";
  }, [selectedSopId, sops]);

  const sopOptions = useMemo(
    () =>
      sops.map((sop, index) => {
        const value = sop._id || sop.id || `sop-${index}`;
        return {
          key: `${value}-${index}`,
          value,
          title: sop.title || `SOP ${index + 1}`
        };
      }),
    [sops]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) {
      return;
    }

    await dispatch(
      askQuestion({
        question: text,
        sopId: selectedSopId,
        sessionId: activeSessionId
      })
    );

    setInput("");
    dispatch(fetchChatHistory());
  };

  const openSession = (sessionId: string) => {
    dispatch(selectSession(sessionId));
    const session = sessions.find((item) => item._id === sessionId);
    setSelectedSopId(session?.sopId || null);
    setHistoryOpen(false);
  };

  const handleResetChat = () => {
    dispatch(clearChat());
    setSelectedSopId(searchParams.get("sopId"));
    setHistoryOpen(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await dispatch(deleteChatSession(sessionId));
  };

  const historyPanel = (
    <>
      <div className="border-b border-border/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Chat History</h2>
              <p className="text-sm text-muted-foreground">Persistent SOP conversations</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetChat} className="shrink-0 rounded-xl">
            <RefreshCcw size={14} />
            <span className="ml-2">Reset Chat</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[240px] xl:h-[calc(100vh-250px)] p-4">
        <div className="space-y-3">
          <button
            onClick={() => {
              dispatch(selectSession(null));
              setHistoryOpen(false);
            }}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
              !activeSessionId
                ? "border-primary bg-primary/5"
                : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <p className="font-semibold">New conversation</p>
            <p className="text-xs text-muted-foreground">Start a fresh question thread</p>
          </button>

          {historyLoading && (
            <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              Loading history...
            </div>
          )}

          {sessions.map((session) => (
            <div
              key={session._id}
              className={`flex items-start gap-2 rounded-2xl border px-4 py-3 transition ${
                activeSessionId === session._id
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <button
                onClick={() => openSession(session._id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="line-clamp-2 font-semibold">{session.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.sopTitle || "All SOPs"} • {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDeleteSession(session._id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex h-[calc(100vh-140px)] flex-col">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">OpsMind AI</h1>
            <p className="text-sm text-muted-foreground">
              Context-aware SOP answers with source citations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl">
                  <History size={16} />
                  <span className="ml-2">History</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Chat History</SheetTitle>
                  <SheetDescription>Open previous conversations and start a new one.</SheetDescription>
                </SheetHeader>
                {historyPanel}
              </SheetContent>
            </Sheet>

            <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
              Scoped to: {selectedSopLabel}
            </div>

            <select
              value={selectedSopId || ""}
              onChange={(event) => setSelectedSopId(event.target.value || null)}
              className="h-11 rounded-xl border border-border/60 bg-background px-4 text-sm text-foreground outline-none"
            >
              <option value="">All SOPs</option>
              {sopOptions.map((sop) => (
                <option key={sop.key} value={sop.value}>
                  {sop.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-2xl">
          <ScrollArea className="flex-1 bg-muted/10 p-8">
            <div className="flex flex-col gap-8">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-70">
                  <div className="mb-6 rounded-full bg-primary/5 p-6">
                    <Sparkles size={48} className="text-primary/40" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Ask a policy question</h3>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    Try something like "How do I process a refund?" and I&apos;ll answer from the indexed SOPs with the exact supporting source.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={`${msg.type}-${index}`}
                  className={`flex gap-4 ${msg.type === "q" ? "ml-auto max-w-[80%] flex-row-reverse" : "mr-auto max-w-[88%]"}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                      msg.type === "q"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/50 bg-background text-primary"
                    }`}
                  >
                    {msg.type === "q" ? <User size={20} /> : <Bot size={20} />}
                  </div>

                  <div className="space-y-3">
                    <div
                      className={`rounded-3xl p-4 text-sm leading-relaxed shadow-sm ${
                        msg.type === "q"
                          ? "rounded-tr-none bg-primary text-primary-foreground"
                          : "rounded-tl-none border border-border/50 bg-background text-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.type === "a" && msg.sources && msg.sources.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {msg.sources.map((source, sourceIndex) => (
                          <div
                            key={`${source.citation}-${sourceIndex}`}
                            className="rounded-2xl border border-border/50 bg-background p-4"
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <FileText size={16} className="text-primary" />
                              <span>{source.citation}</span>
                            </div>
                            <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                              {source.excerpt}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="mr-auto flex max-w-[85%] gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background text-primary shadow-lg">
                    <Bot size={20} />
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl rounded-tl-none border border-border/50 bg-background p-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Verifying SOP context
                    </span>
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border/40 bg-card/90 p-8 backdrop-blur-sm">
            <div className="flex gap-4">
              <Input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a process, policy, or compliance rule..."
                className="h-14 flex-1 rounded-2xl border-border/50 bg-muted/40 px-8 text-base shadow-inner focus-visible:ring-primary"
                onKeyDown={(event) => event.key === "Enter" && handleSend()}
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <p>Hallucination guardrail active</p>
              <p>Source-backed answers only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
