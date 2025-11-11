import http from "http";
import fs from "fs";
import path from "path";

const files = {
  "/nub-oil": "nub-oil.txt",
  "/too-silly": "too-silly.txt",
  "/ball-ball-4": "ball-ball-4.txt",
  "/nub-67": "nub-67.txt"
};

http.createServer((req, res) => {
  const fileName = files[req.url];
  if (fileName && fs.existsSync(fileName)) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    const fileStream = fs.createReadStream(fileName);
    fileStream.pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404: Not found\n");
  }
}).listen(3000, () => console.log("ASCII server ready"));
