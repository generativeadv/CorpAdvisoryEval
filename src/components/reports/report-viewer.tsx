"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ReportViewerProps {
  content: string;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export function ReportViewer({ content }: ReportViewerProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const headings = content.match(/^#{1,3}\s+.+$/gm) || [];
    const items: TocItem[] = headings.map((h) => {
      const level = (h.match(/^#+/) || [""])[0].length;
      const title = h.replace(/^#+\s+/, "").replace(/^Section\s+\d+:\s*/, "");
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return { id, title, level };
    });
    setToc(items);
  }, [content]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex gap-6">
      {toc.length > 0 && (
        <nav className="hidden lg:block w-56 shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-auto">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Contents
          </p>
          <ul className="space-y-1">
            {toc.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "text-xs text-left w-full hover:text-foreground transition-colors",
                    item.level === 2 ? "pl-0" : "pl-3",
                    activeSection === item.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="flex-1 min-w-0 prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => {
              const text = String(children);
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h1 id={id} {...props}>
                  {children}
                </h1>
              );
            },
            h2: ({ children, ...props }) => {
              const text = String(children);
              const cleaned = text.replace(/^Section\s+\d+:\s*/, "");
              const id = cleaned
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h2 id={id} {...props}>
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const text = String(children);
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h3 id={id} {...props}>
                  {children}
                </h3>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full">{children}</table>
              </div>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
