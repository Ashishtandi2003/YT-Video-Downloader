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

    let format =
      quality === "1080"
        ? `bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`
        : quality === "720"
        ? `bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`
        : `bestvideo+bestaudio/best`;

    const command = `yt-dlp -f "${format}" -o "${filename}" "${videoURL}"`;
    console.log("▶️ Running:", command);

    exec(command, (error, stdout, stderr) => {
      console.log("yt-dlp stdout:", stdout);
      console.error("yt-dlp stderr:", stderr);

      if (error) {
        console.error("❌ Download error:", error.message);
        return res.status(500).send("Download failed");
      }

      // 🛡️ Watch for aborted client requests
      let downloadAborted = false;
      res.on("close", () => {
        if (!res.writableEnded) {
          console.warn("⚠️ Client aborted the request.");
          downloadAborted = true;

          // Clean up file if exists
          try {
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
              console.log("🧹 Aborted file deleted:", filepath);
            }
          } catch (cleanupErr) {
            console.warn("⚠️ Cleanup on abort failed:", cleanupErr.message);
          }
        }
      });

      // 📨 Send the file to the client
      res.download(filepath, filename, (err) => {
        if (downloadAborted) return; // Don't continue if client aborted

        if (err) {
          console.error("📤 File send error:", err.message);
        }

        // Try cleanup
        try {
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log("🧹 File deleted:", filepath);
          }
        } catch (unlinkErr) {
          console.warn("⚠️ File cleanup failed:", unlinkErr.message);
        }
      });
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
