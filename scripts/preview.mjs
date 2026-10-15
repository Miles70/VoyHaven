import { startSeoTestServer } from './seo-test-server.mjs';
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const hostIndex = args.indexOf('--host');
const port = portIndex < 0 ? 4173 : Number(args[portIndex + 1]);
const host = hostIndex < 0 ? '127.0.0.1' : args[hostIndex + 1] || '0.0.0.0';
const server = await startSeoTestServer({ port, host });
console.log(`VoyHaven preview: ${server.base}`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
