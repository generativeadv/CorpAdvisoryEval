"use client";

import { Printer, FileDown } from "lucide-react";
import { useState } from "react";

export function PreReadPrintButton() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadDocx = async () => {
    setDownloading(true);
    try {
      const { generatePreReadDocx } = await import("@/lib/export-docx");
      const res = await fetch("/api/firms/all");
      const firms = await res.json();
      const blob = await generatePreReadDocx(firms);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AI-Strategy-Assessment-PreRead.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
      >
        <Printer size={16} />
        Print / PDF
      </button>
      <button
        onClick={handleDownloadDocx}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors disabled:opacity-50"
      >
        <FileDown size={16} />
        {downloading ? "Generating..." : "Download Word"}
      </button>
    </div>
  );
}
