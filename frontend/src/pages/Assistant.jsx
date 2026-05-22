import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bot, Send } from "lucide-react";
import api from "../api/client";

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/chat").then(({ data }) => setMessages(data.messages)).catch(() => null);
  }, []);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = form.get("message");
    event.currentTarget.reset();
    setLoading(true);
    try {
      const { data } = await api.post("/chat", { message });
      setMessages((current) => [...current, ...data.messages]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-cyan-400">AI safety assistant</p>
        <h1 className="text-3xl font-black">Ask SafeTour AI</h1>
      </div>
      <section className="card grid min-h-[620px] grid-rows-[1fr_auto] gap-4">
        <div className="grid content-start gap-3 overflow-auto">
          {!messages.length && (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700">
              <Bot className="mx-auto mb-2 text-cyan-400" />
              Ask about safe routes, scam prevention, local laws, or emergency guidance.
            </div>
          )}
          {messages.map((message) => (
            <div key={message._id} className={`max-w-[85%] rounded-lg p-3 ${message.role === "assistant" ? "bg-cyan-500/10" : "ml-auto bg-safety-green text-white"}`}>
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <input className="input flex-1" name="message" placeholder="Suggest a safe route to my hotel..." required />
          <button className="btn-primary" disabled={loading}><Send size={18} /></button>
        </form>
      </section>
    </main>
  );
}
