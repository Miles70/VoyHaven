import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function audit(directory, label, execute = execFileSync) {
  let output;
  let failed = false;

  try {
    output = execute("npm", ["audit", "--omit=dev", "--json"], {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    if (error.status !== 1) {
      console.error(`${label}: npm audit could not complete (${error.code || error.status || 'execution error'}).`);
      return 1;
    }
    failed = true;
    output = error.stdout;
  }

  let report;
  try {
    report = JSON.parse(output);
  } catch {
    console.error(`${label}: npm audit returned invalid JSON.`);
    return 1;
  }
  const counts = report?.metadata?.vulnerabilities;
  if (report?.error || !counts ||
      !['info', 'low', 'moderate', 'high', 'critical', 'total'].every(key => Number.isSafeInteger(counts[key]) && counts[key] >= 0) ||
      counts.total !== counts.info + counts.low + counts.moderate + counts.high + counts.critical ||
      (failed && counts.total === 0)) {
    console.error(`${label}: npm audit returned an incomplete or failed report.`);
    return 1;
  }
  const blocking = counts.high + counts.critical;

  console.log(
    `${label}: ${counts.high || 0} high, ${counts.critical || 0} critical vulnerabilities.`,
  );
  for (const [name, vulnerability] of Object.entries(report.vulnerabilities || {})) {
    if (!['high', 'critical'].includes(vulnerability.severity)) continue;
    console.log(`  ${name}: ${vulnerability.severity}; affected ${vulnerability.range}; fix ${JSON.stringify(vulnerability.fixAvailable)}`);
    for (const cause of vulnerability.via || []) {
      console.log(typeof cause === 'string' ? `    via ${cause}` : `    ${cause.title} (${cause.url})`);
    }
  }

  return blocking;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = new URL("..", import.meta.url);
  const blocking = audit(root, "Frontend") + audit(new URL("../server/", import.meta.url), "Backend");
  if (blocking > 0) process.exitCode = 1;
}
