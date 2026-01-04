// kill-port.js
// ----------------------------------------
// Cross-platform port killer for port 3000
// Works on Windows, macOS, Linux
// ----------------------------------------

const { exec } = require("child_process");

const PORT = 3000;

function killPortWindows() {
  exec(`netstat -ano | findstr :${PORT}`, (err, stdout) => {
    if (!stdout) {
      console.log(`✔ Port ${PORT} is free.`);
      return process.exit(0);
    }

    const lines = stdout.trim().split("\n");
    const pids = new Set();

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") pids.add(pid);
    });

    if (pids.size === 0) {
      console.log(`✔ Port ${PORT} is free.`);
      return process.exit(0);
    }

    console.log(`🔴 Port ${PORT} is busy. Killing processes:`, [...pids]);

    [...pids].forEach((pid) => {
      exec(`taskkill /F /PID ${pid}`, (killErr) => {
        if (!killErr) console.log(`✔ Killed PID ${pid}`);
      });
    });

    setTimeout(() => process.exit(0), 500);
  });
}

function killPortUnix() {
  exec(`lsof -ti :${PORT}`, (err, stdout) => {
    if (!stdout) {
      console.log(`✔ Port ${PORT} is free.`);
      return process.exit(0);
    }

    const pids = stdout.trim().split("\n");

    console.log(`🔴 Port ${PORT} is busy. Killing processes:`, pids);

    exec(`kill -9 ${pids.join(" ")}`, () => {
      console.log(`✔ Killed processes: ${pids.join(", ")}`);
      process.exit(0);
    });
  });
}

if (process.platform === "win32") {
  killPortWindows();
} else {
  killPortUnix();
}