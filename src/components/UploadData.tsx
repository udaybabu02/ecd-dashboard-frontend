import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload, FileSpreadsheet } from "lucide-react";

const ExcelUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
      setIsError(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage(null);
    setIsError(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://ecd-backend-xqsw.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage("Excel uploaded successfully ✅");
      setFile(null);
    } catch (error: any) {
      setMessage(error.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Upload ECD Excel Data
        </h2>
      </div>

      <Card className="p-6 space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {file ? file.name : "Choose Excel File"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {message && (
          <div
            className={`text-sm font-medium px-4 py-2 rounded-lg ${
              isError
                ? "bg-red-500/10 text-red-600"
                : "bg-green-500/10 text-green-600"
            }`}
          >
            {message}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExcelUpload;