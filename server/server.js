const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

console.log("🧠 Booting up server...");

// Sanitize title
const sanitize = (name) =>
  name.replace(/[^a-zA-Z0-9 \-_]/g, "").replace(/\s+/g, "_").substring(0, 100);

app.get("/", (req, res) => {
  res.send("✅ Server is alive!");
});

app.get("/download", async (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "720";
  const audioOnly = req.query.audioOnly === "true";

  if (!videoURL) return res.status(400).send("Missing video URL");

  exec(`yt-dlp --get-title "${videoURL}"`, (err, stdout) => {
    if (err) return res.status(500).send("Error fetching title");

    const title = sanitize(stdout.trim());
    const outputFilename = audioOnly
      ? `${title}-audio.mp3`
      : `${title}-${quality}p.mp4`;

    const tempFilename = `${title}-temp.${audioOnly ? "m4a" : "mp4"}`;
    const tempPath = path.resolve(tempFilename);
    const finalPath = path.resolve(outputFilename);

    const format = audioOnly
      ? "bestaudio[ext=m4a]/bestaudio"
      : quality === "1080"
        ? `bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`
        : quality === "720"
          ? `bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[ext=mp4]`
          : "bestvideo+bestaudio/best";

    const ytCommand = `yt-dlp -f "${format}" -o "${tempFilename}" "${videoURL}"`;
    console.log("▶️ Running:", ytCommand);

    exec(ytCommand, (err) => {
      if (err) return res.status(500).send("Download failed");

      if (audioOnly) {
        const ffmpegCmd = `ffmpeg -y -i "${tempPath}" -b:a 320k "${finalPath}"`;
        console.log("🎵 Converting audio:", ffmpegCmd);

        exec(ffmpegCmd, (ffmpegErr) => {
          if (ffmpegErr) return res.status(500).send("Audio conversion failed");

          fs.unlink(tempPath, () => {
            res.download(finalPath, outputFilename, (err) => {
              fs.unlink(finalPath, () => {});
            });
          });
        });
      } else {
        res.download(tempPath, outputFilename, (err) => {
          fs.unlink(tempPath, () => {});
        });
      }
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
