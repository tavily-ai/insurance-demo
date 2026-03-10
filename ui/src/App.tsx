import { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import ProgressTracker from "./components/ProgressTracker";
import ResultsDashboard from "./components/ResultsDashboard";
import {
  CategoriesState,
  CategoryKey,
  initialCategoriesState,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [categories, setCategories] = useState<CategoriesState>(
    initialCategoriesState()
  );
  const [isResearching, setIsResearching] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [hasResults, setHasResults] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(
    async (name: string, location: string) => {
      // Reset state
      setCategories(initialCategoriesState());
      setIsResearching(true);
      setCompanyName(name);
      setHasResults(false);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`${API_URL}/api/underwrite/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: name,
            location: location || undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(response.statusText || "Request failed");
        }
        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                handleEvent(event);
              } catch {
                // skip malformed lines
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Stream error:", err);
        }
      } finally {
        setIsResearching(false);
      }
    },
    []
  );

  const handleEvent = useCallback((event: any) => {
    const cat = event.category as CategoryKey | undefined;

    switch (event.type) {
      case "start":
        // mark all categories as pending (already default)
        break;

      case "progress":
        if (cat) {
          setCategories((prev) => ({
            ...prev,
            [cat]: {
              ...prev[cat],
              status: "in_progress" as const,
              progressMessage: event.message || "",
            },
          }));
        }
        break;

      case "sources_found":
        if (cat) {
          setCategories((prev) => ({
            ...prev,
            [cat]: {
              ...prev[cat],
              sources: [
                ...prev[cat].sources,
                ...(event.sources || []),
              ],
            },
          }));
        }
        break;

      case "category_complete":
        if (cat) {
          setCategories((prev) => ({
            ...prev,
            [cat]: {
              status: "completed" as const,
              data: event.data || {},
              sources: event.sources || prev[cat].sources,
              progressMessage: "",
            },
          }));
          setHasResults(true);
        }
        break;

      case "error":
        if (cat) {
          setCategories((prev) => ({
            ...prev,
            [cat]: {
              ...prev[cat],
              status: "error" as const,
              progressMessage: event.message || "An error occurred",
            },
          }));
        }
        break;

      case "complete":
        // Final event — all done
        break;
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsResearching(false);
  }, []);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Background image layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/tavily_landscapes_edited_11.webp)',
          opacity: 0.7,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      {/* Top gradient fade */}
      <div
        className="fixed inset-x-0 top-0 z-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, var(--color-background), transparent)',
          transform: 'translateZ(0)',
        }}
      />
      {/* Bottom gradient fade */}
      <div
        className="fixed inset-x-0 bottom-0 z-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--color-background), transparent)',
          transform: 'translateZ(0)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <Header />

        <div className="mt-10">
          <SearchForm
            onSearch={handleSearch}
            isLoading={isResearching}
            onCancel={handleCancel}
          />
        </div>

        <AnimatePresence mode="wait">
          {isResearching && (
            <ProgressTracker
              key="progress"
              categories={categories}
              companyName={companyName}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasResults && (
            <ResultsDashboard
              key="results"
              categories={categories}
              companyName={companyName}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
