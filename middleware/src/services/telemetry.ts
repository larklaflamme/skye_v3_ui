import os from 'os';
import { execSync } from 'child_process';
import type { TelemetryMetrics } from '../types.js';

let startTime = Date.now();

export function getUptime(): string {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getSystemUptime(): string {
  try {
    const uptime = os.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  } catch {
    return 'unknown';
  }
}

export function getCpuUsage(): number {
  try {
    const cpus = os.cpus();
    // Simple average of current load
    const loadAvg = os.loadavg()[0];
    const cpuCount = cpus.length;
    return Math.round((loadAvg / cpuCount) * 100);
  } catch {
    return 0;
  }
}

export function getMemoryUsage(): string {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const usedGB = (used / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (total / (1024 * 1024 * 1024)).toFixed(0);
  const pct = Math.round((used / total) * 100);
  return `${pct}% (${usedGB} GB / ${totalGB} GB)`;
}

export function getDiskUsage(): string {
  try {
    const result = execSync("df -h / | tail -1 | awk '{print $5, $3, $2}'", { encoding: 'utf-8' }).trim();
    const [pct, used, total] = result.split(' ');
    return `${pct} (${used} / ${total})`;
  } catch {
    return 'unknown';
  }
}

export function getEbv3Pid(): number | null {
  try {
    const result = execSync('pgrep -f "ebv3" | head -1', { encoding: 'utf-8' }).trim();
    return result ? parseInt(result, 10) : null;
  } catch {
    return null;
  }
}

export function collectTelemetry(): TelemetryMetrics {
  return {
    ebv3Pid: getEbv3Pid(),
    skyePort: 8765,
    mcpTools: 0, // Will be populated when connected to Skye Engine
    mcpLatency: 'N/A',
    neonPing: 'N/A',
    cpu: getCpuUsage(),
    ram: getMemoryUsage(),
    disk: getDiskUsage(),
    uptime: getSystemUptime(),
    middlewareUptime: getUptime(),
  };
}
