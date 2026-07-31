"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <form onSubmit={(e) => e.preventDefault()}>
          <FileUpload onFilesChange={(files) => setSelectedFiles(files)} />
        </form>
      </div>
    </main>
  );
}



