// Downloader.jsx
import { useState } from "react";

export default function Downloader() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("720");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    if (!url) {
      setStatus("Please enter a YouTube URL.");
      return;
    }

    setLoading(true);
    setStatus("Starting download...");

    // 🔗 Open in new tab to let browser handle the file and name
    const downloadLink = `http://localhost:4000/download?url=${encodeURIComponent(
      url
    )}&quality=${quality}`;
    window.open(downloadLink, "_blank");

    setStatus("⏳ Download started in new tab. Check your downloads.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 text-white px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          YouTube Video Downloader
        </h1>

        <input
          type="text"
          placeholder="Enter YouTube URL"
          className="w-full px-4 py-2 rounded-lg bg-white text-black mb-4 outline-none"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <select
          className="w-full px-4 py-2 mb-4 rounded-lg text-black bg-white"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
        >
          <option value="360">360p</option>
          <option value="480">480p</option>
          <option value="720">720p (HD)</option>
          <option value="1080">1080p (Full HD)</option>
        </select>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
        >
          {loading ? "Downloading..." : "Download Video"}
        </button>

        {status && <p className="text-sm mt-4 text-center">{status}</p>}
      </div>
    </div>
  );
}
