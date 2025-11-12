import http from "http";
import fs from "fs";

const files = {
  "/nub-oil": "nub-oil.txt",
  "/too-silly": "too-silly.txt",
  "/ball-ball-4": "ball-ball-4.txt",
  "/nub-67": "nub-67.txt"
};

const port = 8000;
const lineDelay = 50;  // delay between each line
const frameDelay = 150; // optional delay between frames

// Load frames from a file
function loadFrames(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split(/\n\s*\n/)
    .map(f => f.trim())
    .filter(f => f.length > 0);
}

http.createServer((req, res) => {
  const fileName = files[req.url];

  if (!fileName || !fs.existsSync(fileName)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("404: Not found\n");
  }

  const frames = loadFrames(fileName);
  if (frames.length === 0) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    return res.end("No frames to display\n");
  }

  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
  });

  let frameIndex = 0;

  function showFrame() {
    if (res.writableEnded) return;

    const lines = frames[frameIndex].split("\n");
    let lineIndex = 0;

    function writeLine() {
      if (res.writableEnded) return;

      // Clear screen at start of frame
      if (lineIndex === 0) res.write("\x1b[2J\x1b[H");

      res.write(lines[lineIndex] + "\n");
      lineIndex++;

      if (lineIndex < lines.length) {
        setTimeout(writeLine, lineDelay);
      } else {
        // move to next frame after a short pause
        frameIndex = (frameIndex + 1) % frames.length;
        setTimeout(showFrame, frameDelay);
      }
    }

    writeLine();
  }

  showFrame();

  req.on("close", () => res.end());
}).listen(port, "0.0.0.0", () =>
  console.log(`ASCII flipbook server running on port ${port}`)
);
