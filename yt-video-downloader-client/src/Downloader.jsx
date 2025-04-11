// Downloader.jsx
import { useState } from "react";

export default function Downloader() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("1080");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    if (!url) {
      setStatus("Please enter a YouTube URL.");
      return;
    }

    setLoading(true);
    setStatus("Starting download...");

    const downloadLink = `https://yt-video-downloader-production-6c85.up.railway.app/download?url=${encodeURIComponent(
      url
    )}&quality=${quality}`;
    window.open(downloadLink, "_blank");

    setStatus("⏳ Download started in new tab. Check your downloads.");
    setLoading(false);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute w-[400px] h-[400px] bg-pink-500 rounded-full blur-[150px] opacity-30 animate-pulse top-10 left-10" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600 rounded-full blur-[150px] opacity-30 animate-pulse bottom-10 right-10" />

      {/* Glass Card */}
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold mb-6 text-center text-white tracking-wide">
          🎬 Ashish yt Downloader
        </h1>

        <input
          type="text"
          placeholder="Enter YouTube URL"
          className="w-full px-5 py-3 rounded-lg bg-white/90 text-black placeholder-gray-500 mb-4 outline-none shadow-inner focus:ring-2 focus:ring-red-400 transition"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <select
          className="w-full px-5 py-3 mb-4 rounded-lg text-black bg-white/90 shadow-inner focus:ring-2 focus:ring-red-400 transition"
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
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:scale-105"
        >
          {loading ? "Downloading..." : "Download Video"}
        </button>

        {status && (
          <p className="text-sm mt-5 text-center text-gray-200">{status}</p>
        )}
      </div>
    </div>
  );
}
