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
const lineDelay = 30;     // ms between each line
const frameRepeat = 2;    // how many times to repeat each frame

// Load frames from files
function getAllFrames() {
  const allFrames = [];
  for (const file of Object.values(files)) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    // Split frames by a single empty line
    const frames = content.split(/\n\s*\n/).map(f => f.trim());
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
    res.writeHead(200, { "Content-Type": "text/plain" });

    let frameIndex = 0;
    let repeatCounter = 0;

    function showFrame() {
      if (res.writableEnded) return;

      const lines = allFrames[frameIndex].split("\n");
      let lineIndex = 0;

      function writeLine() {
        if (res.writableEnded) return;

        if (lineIndex >= lines.length) {
          repeatCounter++;
          if (repeatCounter >= frameRepeat) {
            repeatCounter = 0;
            frameIndex = (frameIndex + 1) % allFrames.length; // next frame
          }
          setTimeout(showFrame, lineDelay);
          return;
        }

        if (lineIndex === 0) res.write("\x1b[2J\x1b[H"); // clear screen at start of frame
        res.write(lines[lineIndex] + "\n");
        lineIndex++;
        setTimeout(writeLine, lineDelay);
      }

      writeLine();
    }

    showFrame();

    req.on("close", () => res.end());

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
}).listen(port, "0.0.0.0", () => console.log(`ASCII flipbook server running on port ${port}`));
