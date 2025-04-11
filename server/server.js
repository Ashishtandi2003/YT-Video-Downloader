const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// ✅ Sanitize filenames (cross-platform safe)
const sanitize = (name) =>
  name
    .replace(/[^a-zA-Z0-9 \-_]/g, "") // remove special chars
    .replace(/\s+/g, "_")             // replace spaces with _
    .substring(0, 100);               // limit filename length

app.get("/download", async (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "720";

  if (!videoURL) return res.status(400).send("Missing video URL");

  // Step 1: Get sanitized title
  exec(`yt-dlp --get-title "${videoURL}"`, (err, stdout) => {
    if (err) {
      console.error("❌ Failed to fetch title:", err);
      return res.status(500).send("Error fetching title");
    }

    const title = sanitize(stdout.trim());
    const filename = `${title}-${quality}p.mp4`;
    const filepath = path.resolve(filename);

    // Step 2: Choose correct format
    let format;
    if (quality === "1080") {
      format = `bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`;
    } else if (quality === "720") {
      format = `bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`;
    } else {
      format = `bestvideo+bestaudio/best`;
    }

    const command = `yt-dlp -f "${format}" -o "${filename}" "${videoURL}"`;
    console.log("▶️ Running:", command);

    // Step 3: Download video
    exec(command, (error) => {
      if (error) {
        console.error("❌ Download error:", error.message);
        return res.status(500).send("Download failed");
      }

      // Step 4: Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error("📤 File send error:", err);
        }

        // Step 5: Delete file after sending
        fs.unlink(filepath, (unlinkErr) => {
          if (unlinkErr) {
            console.warn("⚠️ File cleanup failed:", unlinkErr);
          } else {
            console.log("🧹 File deleted:", filepath);
          }
        });
      });
    });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
