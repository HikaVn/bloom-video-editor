import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.BLOOM_EXPORT_PORT || 4175);
const maxBodyBytes = 1024 * 1024;
const ffmpegCandidates = [
  process.env.FFMPEG_PATH,
  join(process.env.LOCALAPPDATA || "", "Programs", "ffmpeg", "ffmpeg-8.1.1-essentials_build", "bin", "ffmpeg.exe"),
  "ffmpeg",
].filter(Boolean);

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:4173");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

function sendJson(response, statusCode, payload) {
  setCors(response);
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new Error("request body is too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("request body must be JSON"));
      }
    });
    request.on("error", reject);
  });
}

function assertLocalVideoUrl(videoUrl) {
  const parsedUrl = new URL(videoUrl);
  const isLocalHost = parsedUrl.hostname === "127.0.0.1" || parsedUrl.hostname === "localhost";
  if (parsedUrl.protocol !== "http:" || !isLocalHost || parsedUrl.port !== "4174") {
    throw new Error("only local video URLs from 127.0.0.1:4174 are supported");
  }
  return parsedUrl.toString();
}

function makeDownloadName(name) {
  const baseName = String(name || "bloom-trim")
    .replace(/\.[^.]+$/, "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .slice(0, 80) || "bloom-trim";
  return `${baseName}-trim-${Date.now()}.mp4`;
}

async function pickFfmpeg() {
  for (const candidate of ffmpegCandidates) {
    const result = await new Promise((resolve) => {
      const child = spawn(candidate, ["-version"], { windowsHide: true });
      child.on("error", () => resolve(null));
      child.on("exit", (code) => resolve(code === 0 ? candidate : null));
    });
    if (result) {
      return result;
    }
  }
  throw new Error("ffmpeg was not found");
}

function runFfmpeg(ffmpegPath, args) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `ffmpeg exited with code ${code}`));
    });
  });
}

async function handleExport(request, response) {
  const body = await readJsonBody(request);
  const videoUrl = assertLocalVideoUrl(body.videoUrl);
  const start = Math.max(0, Number(body.start) || 0);
  const end = Math.max(start + 0.2, Number(body.end) || start + 1);
  const duration = Math.min(60 * 30, end - start);
  const ffmpegPath = await pickFfmpeg();
  const workDir = await mkdtemp(join(tmpdir(), "bloom-export-"));
  const outputPath = join(workDir, "trim.mp4");

  try {
    await runFfmpeg(ffmpegPath, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      start.toFixed(3),
      "-i",
      videoUrl,
      "-t",
      duration.toFixed(3),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-crf",
      "22",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ]);

    const outputStat = await stat(outputPath);
    setCors(response);
    response.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-Length": outputStat.size,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(makeDownloadName(body.videoName))}`,
    });
    createReadStream(outputPath)
      .on("close", () => rm(workDir, { recursive: true, force: true }).catch(() => {}))
      .pipe(response);
  } catch (error) {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      setCors(response);
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { ok: true, ffmpeg: await pickFfmpeg() });
      return;
    }

    if (request.method === "POST" && request.url === "/export") {
      await handleExport(request, response);
      return;
    }

    sendJson(response, 404, { error: "not found" });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "export failed" });
  }
});

server.listen(port, host, () => {
  console.log(`Bloom export helper listening at http://${host}:${port}`);
});
