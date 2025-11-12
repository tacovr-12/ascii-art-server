import http from "http";
import fs from "fs";

const files = {
  "/nub-oil": "nub-oil.txt",
  "/too-silly": "too-silly.txt",
  "/ball-ball-4": "ball-ball-4.txt",
  "/nub-67": "nub-67.txt"
};

const port = 8000;

http.createServer((req, res) => {
  if (req.url === "/repeat") {
    // Check all files exist first
    const missingFiles = Object.values(files).filter(f => !fs.existsSync(f));
    if (missingFiles.length > 0) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Missing files: " + missingFiles.join(", ") + "\n");
    }

    // Read all files and split into frames
    const allFrames = [];
    for (const file of Object.values(files)) {
      const frames = fs.readFileSync(file, "utf8").split("\n\n\n");
      allFrames.push(...frames);
    }

    res.writeHead(200, { "Content-Type": "text/plain" });

    let i = 0;
    const interval = setInterval(() => {
      res.write("\x1b[2J\x1b[H"); // clear the screen
      res.write(allFrames[i] + "\n");
      i = (i + 1) % allFrames.length; // loop through all frames
    }, 100);

    req.on("close", () => clearInterval(interval));
  } else {
    // Handle static files
    const fileName = files[req.url];
    if (fileName && fs.existsSync(fileName)) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      const fileStream = fs.createReadStream(fileName);
      fileStream.pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404: Not found\n");
    }
  }
}).listen(port, "0.0.0.0", () => console.log("ASCII server ready"));
