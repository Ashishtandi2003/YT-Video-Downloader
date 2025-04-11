const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

console.log("🧠 Booting up server...");
console.log("PORT from env:", process.env.PORT);

// ✅ Root check
app.get("/", (req, res) => {
  res.send("✅ Server is alive!");
});

// 🧼 Sanitize filenames
const sanitize = (name) =>
  name.replace(/[^a-zA-Z0-9 \-_]/g, "").replace(/\s+/g, "_").substring(0, 100);

app.get("/download", async (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "720";

  if (!videoURL) return res.status(400).send("Missing video URL");

  exec(`yt-dlp --get-title "${videoURL}"`, (err, stdout) => {
    if (err) {
      console.error("❌ Failed to fetch title:", err);
      return res.status(500).send("Error fetching title");
    }

    const title = sanitize(stdout.trim());
    const filename = `${title}-${quality}p.mp4`;
    const filepath = path.resolve(filename);

    let format = quality === "1080"
      ? `bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`
      : quality === "720"
      ? `bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`
      : `bestvideo+bestaudio/best`;

    const command = `yt-dlp -f "${format}" -o "${filename}" "${videoURL}"`;
    console.log("▶️ Running:", command);

    exec(command, (error) => {
      if (error) {
        console.error("❌ Download error:", error.message);
        return res.status(500).send("Download failed");
      }

      res.download(filepath, filename, (err) => {
        if (err) console.error("📤 File send error:", err);
        fs.unlink(filepath, (unlinkErr) => {
          if (unlinkErr) console.warn("⚠️ File cleanup failed:", unlinkErr);
          else console.log("🧹 File deleted:", filepath);
        });
      });
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
