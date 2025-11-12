import http from "http";
import fs from "fs";

const files = {
  "/nub-oil": "nub-oil.txt",
  "/too-silly": "too-silly.txt",
  "/ball-ball-4": "ball-ball-4.txt",
  "/nub-67": "nub-67.txt"
};

const port = 8000;
const frameDelay = 100; // ms between chunks

// Load "frames" by splitting file on ', '
function loadFrames(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split(/,\s*'/)     // split on your ', ' separator
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

  const interval = setInterval(() => {
    if (res.writableEnded) return clearInterval(interval);

    res.write("\x1b[2J\x1b[H"); // clear screen
    res.write(frames[frameIndex] + "\n");

    frameIndex = (frameIndex + 1) % frames.length; // loop forever
  }, frameDelay);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });

}).listen(port, "0.0.0.0", () =>
  console.log(`ASCII flipbook server running on port ${port}`)
);
