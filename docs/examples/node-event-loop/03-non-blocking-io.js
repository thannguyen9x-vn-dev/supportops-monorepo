const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(__dirname, "sample.txt");
fs.writeFileSync(filePath, "Node.js event loop demo\n".repeat(50000), "utf8");

let tick = 0;
const timer = setInterval(() => {
  tick += 1;
  console.log(`tick ${tick}`);
  if (tick >= 20) clearInterval(timer);
}, 100);

console.log("Start async read...");
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Async read finished. chars=${data.length}`);
});

console.log("Main thread keeps running after readFile call.");
