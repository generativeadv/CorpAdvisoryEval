"use client";

import { Printer } from "lucide-react";

export function PreReadPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
    >
      <Printer size={16} />
      Export to PDF
    </button>
  );
}
