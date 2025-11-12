import http from "http";
import fs from "fs";

const files = {
  "/nub-oil": "nub-oil.txt",
  "/too-silly": "too-silly.txt",
  "/ball-ball-4": "ball-ball-4.txt",
  "/nub-67": "nub-67.txt"
};

const port = 8000;

// Settings
const frameDelay = 150; // ms between frames

// Load frames from files
function getAllFrames() {
  const allFrames = [];
  for (const file of Object.values(files)) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    // Split frames by a single empty line
    const frames = content.split(/\n\s*\n/).map(f => f.trim()).filter(f => f.length > 0);
    allFrames.push(...frames);
  }
  return allFrames;
}

http.createServer((req, res) => {
  if (req.url === "/repeat") {
    const missingFiles = Object.values(files).filter(f => !fs.existsSync(f));
    if (missingFiles.length > 0) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Missing files: " + missingFiles.join(", ") + "\n");
    }

    const allFrames = getAllFrames();
    if (allFrames.length === 0) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("No frames to display\n");
    }

    // Keep response open and stream chunks
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    let frameIndex = 0;

    const interval = setInterval(() => {
      if (res.writableEnded) return clearInterval(interval);

      // Clear screen and write current frame
      res.write("\x1b[2J\x1b[H");
      res.write(allFrames[frameIndex] + "\n");

      // Move to next frame, looping endlessly
      frameIndex = (frameIndex + 1) % allFrames.length;
    }, frameDelay);

    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });

  } else {
    // Serve static files
    const fileName = files[req.url];
    if (fileName && fs.existsSync(fileName)) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      fs.createReadStream(fileName).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404: Not found\n");
    }
  }
}).listen(port, "0.0.0.0", () =>
  console.log(`ASCII flipbook server running on port ${port}`)
);
