export const RUN_TIMEOUT = 5000
export const DEFAULT_CODE = `// 支持 await，按 Ctrl / ⌘ + Enter 运行
const numbers = [1, 2, 3, 4, 5];
console.log("求和：", numbers.reduce((sum, n) => sum + n, 0));
await new Promise(resolve => setTimeout(resolve, 100));
console.info({ message: "Hello, Hollow!", doubled: numbers.map(n => n * 2) });
`
export const FETCH_CODE = `// 接口需要允许跨域访问（CORS）
const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
if (!response.ok) throw new Error("HTTP " + response.status);
console.log(await response.json());
`

// A worker keeps synchronous loops away from the page's event loop so stopping
// and the timeout can actually terminate execution. The iframe has an opaque origin.
export function buildSandboxDocument(code: string, runId: string) {
  const workerCode = `
const originalFetch = self.fetch.bind(self);
self.fetch = (input, init) => originalFetch(input, { ...init, credentials: 'omit' });
function format(value) {
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === 'string') return value;
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'function') return '[Function ' + (value.name || 'anonymous') + ']';
  try {
    const seen = new WeakSet();
    return JSON.stringify(value, (_, item) => {
      if (typeof item === 'bigint') return item.toString() + 'n';
      if (typeof item === 'undefined') return '[undefined]';
      if (typeof item === 'function') return '[Function]';
      if (item && typeof item === 'object') {
        if (seen.has(item)) return '[Circular]';
        seen.add(item);
      }
      return item;
    }, 2) ?? String(value);
  } catch { return String(value); }
}
let logCount = 0;
function send(level, args) {
  if (logCount++ < 500) self.postMessage({ kind: 'log', level, text: args.map(format).join(' ').slice(0, 20000) });
}
for (const level of ['log', 'info', 'warn', 'error', 'debug']) console[level] = (...args) => send(level === 'debug' ? 'log' : level, args);
self.addEventListener('unhandledrejection', event => send('error', [event.reason]));
(async () => {
  try {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    await new AsyncFunction(${JSON.stringify(code)})();
  } catch (error) { send('error', [error]); }
  finally { self.postMessage({ kind: 'done' }); }
})();`
  const safeWorker = JSON.stringify(workerCode).replace(/</g, '\\u003c')
  const safeId = JSON.stringify(runId).replace(/</g, '\\u003c')
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src http: https:"></head><body><script>
const runId = ${safeId};
const workerUrl = URL.createObjectURL(new Blob([${safeWorker}], { type: 'text/javascript' }));
const worker = new Worker(workerUrl);
function send(data) { parent.postMessage({ ...data, source: 'hollow-js-runner', runId }, '*'); }
worker.onmessage = event => { send(event.data); if (event.data.kind === 'done') { worker.terminate(); URL.revokeObjectURL(workerUrl); } };
worker.onerror = event => { send({ kind: 'log', level: 'error', text: event.message || '沙箱启动失败' }); send({ kind: 'done' }); worker.terminate(); };
window.addEventListener('message', event => { if (event.source === parent && event.data?.runId === runId && event.data?.kind === 'stop') worker.terminate(); });
window.addEventListener('pagehide', () => worker.terminate());
</script></body></html>`
}
