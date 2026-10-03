'use client'

import { Download } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-full border border-sand/25 bg-black/40 px-3 py-1.5 text-sm text-white shadow-md backdrop-blur-md hover:bg-black/55"
    >
      <Download className="h-4 w-4" />
      Save as PDF
    </button>
  )
}