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

function makeId(text: string): string {
  return text
    .replace(/^Section\s+\d+:\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanTitle(text: string): string {
  return text.replace(/^Section\s+\d+:\s*/, "");
}

export function ReportViewer({ content }: ReportViewerProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const headings = content.match(/^#{1,3}\s+.+$/gm) || [];
    const items: TocItem[] = headings.map((h) => {
      const level = (h.match(/^#+/) || [""])[0].length;
      const rawTitle = h.replace(/^#+\s+/, "");
      const title = cleanTitle(rawTitle);
      const id = makeId(rawTitle);
      return { id, title, level };
    });
    setToc(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    const headingEls = document.querySelectorAll(
      "#report-content h1[id], #report-content h2[id], #report-content h3[id]"
    );
    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex gap-8">
      {/* TOC */}
      {toc.length > 0 && (
        <nav className="hidden lg:block w-52 shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-auto pr-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Contents
          </p>
          <ul className="space-y-0.5 border-l border-border">
            {toc.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "text-xs text-left w-full hover:text-foreground transition-colors py-1 border-l-2 -ml-px",
                    item.level <= 2 ? "pl-3" : "pl-5",
                    activeSection === item.id
                      ? "text-primary border-primary font-medium"
                      : "text-muted-foreground border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Report content */}
      <article id="report-content" className="flex-1 min-w-0 max-w-3xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => {
              const text = String(children);
              const id = makeId(text);
              return (
                <h1
                  id={id}
                  className="text-2xl font-bold mt-12 mb-4 pb-3 border-b-2 border-primary/20 first:mt-0"
                >
                  {cleanTitle(text)}
                </h1>
              );
            },
            h2: ({ children }) => {
              const text = String(children);
              const id = makeId(text);
              return (
                <h2
                  id={id}
                  className="text-xl font-bold mt-10 mb-3 pb-2 border-b border-border first:mt-0"
                >
                  {cleanTitle(text)}
                </h2>
              );
            },
            h3: ({ children }) => {
              const text = String(children);
              const id = makeId(text);
              return (
                <h3
                  id={id}
                  className="text-base font-semibold mt-8 mb-2 text-foreground/90"
                >
                  {text}
                </h3>
              );
            },
            h4: ({ children }) => (
              <h4 className="text-sm font-semibold mt-6 mb-1.5 text-foreground/80">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-sm leading-relaxed text-foreground/80 mb-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="text-sm leading-relaxed text-foreground/80 space-y-2 mb-5 ml-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="text-sm leading-relaxed text-foreground/80 space-y-2 mb-5 ml-1 list-decimal list-inside">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2">
                <span className="text-primary/40 mt-1.5 shrink-0 text-[8px]">
                  &#9679;
                </span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground/70">{children}</em>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-3 border-primary/30 pl-4 py-1 my-4 text-sm text-foreground/70 italic">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/60 hover:text-primary underline underline-offset-2 decoration-primary/20 hover:decoration-primary/50 transition-colors text-[11px]"
              >
                {children}
              </a>
            ),
            hr: () => <hr className="my-8 border-border/50" />,
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 border rounded-lg">
                <table className="min-w-full text-xs">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/50 border-b">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="text-left px-3 py-2 font-semibold text-foreground/70 text-xs">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border-b border-border/30 text-foreground/80 text-xs leading-relaxed align-top">
                {children}
              </td>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-muted/30 transition-colors">
                {children}
              </tr>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
