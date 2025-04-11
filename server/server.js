const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// 🧼 Clean file names
function sanitize(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").slice(0, 100);
}

app.get("/download", async (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "720"; // default quality

  if (!videoURL) {
    return res.status(400).send("Missing video URL");
  }

  // Step 1: get title using yt-dlp
  exec(`yt-dlp --get-title "${videoURL}"`, (err, stdout) => {
    if (err) {
      console.error("Failed to fetch title:", err);
      return res.status(500).send("Error fetching title");
    }

    const title = sanitize(stdout.trim());
    const outputFile = `${title}-${quality}p.mp4`;

    // format selector based on quality
    let format = '';
    if (quality === "1080") {
      format = `bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`;
    } else if (quality === "720") {
      format = `bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`;
    } else {
      format = `bestvideo+bestaudio/best`;
    }

    const command = `yt-dlp -f "${format}" -o "${outputFile}" "${videoURL}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Download error:", error.message);
        return res.status(500).send("Download failed");
      }

      const filePath = path.join(__dirname, outputFile);
      res.download(filePath, outputFile, (err) => {
        if (err) console.error("File send error:", err);
        fs.unlink(filePath, () => {}); // clean up
      });
    });
  });
});

app.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000");
});
