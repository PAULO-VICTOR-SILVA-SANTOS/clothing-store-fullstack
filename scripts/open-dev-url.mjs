import { spawn } from 'node:child_process'

const port = Number(process.argv[2] || process.env.DEV_SERVER_PORT || 5173) || 5173
const url = `http://127.0.0.1:${port}/`

/** Abre no navegador do sistema (Chrome, Edge, Firefox…) sem bloquear o terminal. */
if (process.platform === 'win32') {
  const child = spawn('cmd', ['/c', 'start', '', url], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
} else if (process.platform === 'darwin') {
  const child = spawn('open', [url], { detached: true, stdio: 'ignore' })
  child.unref()
} else {
  const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' })
  child.unref()
}
