import { useState, useCallback } from "react";
import { startDownload } from "../lib/api";

export default function useDownload() {
  const [status, setStatus] = useState("idle"); // idle | streaming | complete | error
  const [progress, setProgress] = useState({
    steps: [],
    currentStep: "",
    percent: 0,
    message: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const start = useCallback(async (url, options = {}) => {
    setStatus("streaming");
    setProgress({ steps: [], currentStep: "Initializing", percent: 0, message: "Sending request..." });
    setResult(null);
    setError(null);

    try {
      const res = await startDownload(url, options);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Server error" }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      // Read SSE from fetch response body
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processEvents = (text) => {
        const lines = text.split("\n");
        let eventType = "progress";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            eventData = line.slice(5).trim();
          } else if (line === "" && eventData) {
            try {
              const data = JSON.parse(eventData);

              if (eventType === "progress") {
                setProgress((prev) => ({
                  steps: [...prev.steps, data],
                  currentStep: data.step || prev.currentStep,
                  percent: data.percent || prev.percent,
                  message: data.message || prev.message,
                }));
              } else if (eventType === "complete") {
                setResult(data);
                setStatus("complete");
              } else if (eventType === "error") {
                setError(data.message || "Unknown error");
                setStatus("error");
              }
            } catch {
              // Skip malformed data
            }
            eventType = "progress";
            eventData = "";
          }
        }

        return eventData ? `event:${eventType}\ndata:${eventData}\n` : "";
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          processEvents(part + "\n\n");
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        processEvents(buffer + "\n\n");
      }
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress({ steps: [], currentStep: "", percent: 0, message: "" });
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, result, error, start, reset };
}
