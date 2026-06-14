// ============================================================
// academia.io — useChatbot Hook
// ============================================================

import { useState, useCallback } from "react";
import { chatbot } from "../services/api";

export function useChatbot() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(async (text) => {
    setSending(true);
    setError(null);
    try {
      const result = await chatbot.send(text);
      setMessages(result.history);
      return result.reply;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSending(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const history = await chatbot.history();
      setMessages(history.reverse());
    } catch (err) {
      // silent
    }
  }, []);

  return { messages, sending, error, send, loadHistory };
}
