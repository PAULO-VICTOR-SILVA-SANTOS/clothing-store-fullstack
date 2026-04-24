/** URL base da API (vazio = mesma origem / proxy do Vite). */
export function apiOrigin(): string {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
    : ''
}

/** Chave do localStorage para JWT do painel (não usar no checkout do cliente). */
export const ADMIN_JWT_STORAGE_KEY = 'apd_admin_jwt'

/** Remove o token JWT salvo no navegador. */
export function clearAdminJwt(): void {
  try {
    localStorage.removeItem(ADMIN_JWT_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function httpErroMessage(r: Response, data: unknown): string {
  const msg = typeof (data as { erro?: string }).erro === 'string' ? (data as { erro: string }).erro.trim() : ''
  if (msg) return msg
  const st = typeof r.statusText === 'string' ? r.statusText.trim() : ''
  if (st) return st
  return r.status ? `HTTP ${r.status}` : 'Resposta inválida da API'
}

/** Mesmo valor que `ADMIN_API_KEY` no servidor — só para rotas de gestão (nunca no checkout do cliente).
 * Prioridade: JWT em localStorage (Bearer) > `VITE_ADMIN_API_KEY` (header x-admin-key). */
function withAdmin(base: Record<string, string> = {}): Record<string, string> {
  const out = { ...base }
  try {
    const jwt = localStorage.getItem(ADMIN_JWT_STORAGE_KEY)?.trim()
    if (jwt) {
      out.Authorization = `Bearer ${jwt}`
      return out
    }
  } catch {
    /* ignore */
  }
  const k = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_API_KEY
  if (k) out['x-admin-key'] = String(k)
  return out
}

async function fetchWithAdminAuthRetry(
  url: string,
  init: RequestInit,
  headerBase: Record<string, string>
): Promise<Response> {
  const run = () => fetch(url, { ...init, headers: withAdmin(headerBase) })
  let r = await run()
  if (r.status === 401) {
    clearAdminJwt()
    r = await run()
  }
  return r
}

/** Login do lojista na API (POST /auth/login). Requer `JWT_SECRET` e `ADMIN_PASSWORD` ou `ADMIN_API_KEY` no servidor. */
export async function postAuthLogin(
  password: string
): Promise<{ ok: true; token: string; expiresInSec: number } | { ok: false; erro: string; status: number }> {
  try {
    const r = await fetch(`${apiOrigin()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ password })
    })
    const data: unknown = await r.json().catch(() => ({}))
    if (!r.ok) {
      return { ok: false, erro: httpErroMessage(r, data), status: r.status }
    }
    const token = typeof (data as { token?: string }).token === 'string' ? (data as { token: string }).token : ''
    const expiresInSec = Number((data as { expiresInSec?: number }).expiresInSec)
    if (!token) return { ok: false, erro: 'Resposta sem token', status: r.status }
    return { ok: true, token, expiresInSec: Number.isFinite(expiresInSec) ? expiresInSec : 8 * 3600 }
  } catch {
    return { ok: false, erro: 'Sem conexão com a API', status: 0 }
  }
}

/** ID gerado pelo MongoDB (24 hex). */
export function isMongoObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id)
}

export async function fetchProdutos(timeoutMs: number): Promise<unknown[] | null> {
  const url = `${apiOrigin()}/produtos`
  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' }
    })
    clearTimeout(tid)
    if (!r.ok) return null
    const data: unknown = await r.json()
    return Array.isArray(data) ? data : null
  } catch {
    clearTimeout(tid)
    return null
  }
}

/** Lista pedidos (GET /pedidos). Resposta: array legado ou `{ items, total, limit, skip }`. */
export async function fetchPedidos(timeoutMs = 12000): Promise<unknown[] | null> {
  const url = `${apiOrigin()}/pedidos`
  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetchWithAdminAuthRetry(url, { signal: ctrl.signal }, { Accept: 'application/json' })
    clearTimeout(tid)
    if (!r.ok) return null
    const data: unknown = await r.json()
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
      return (data as { items: unknown[] }).items
    }
    return null
  } catch {
    clearTimeout(tid)
    return null
  }
}

export async function postProdutoJson(
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; erro: string; status: number }> {
  try {
    const r = await fetchWithAdminAuthRetry(
      `${apiOrigin()}/produtos`,
      { method: 'POST', body: JSON.stringify(body) },
      { 'Content-Type': 'application/json', Accept: 'application/json' }
    )
    const data: unknown = await r.json().catch(() => ({}))
    if (!r.ok) {
      return { ok: false, erro: httpErroMessage(r, data), status: r.status }
    }
    return { ok: true, data }
  } catch {
    return { ok: false, erro: 'Sem conexão com a API', status: 0 }
  }
}

export async function patchProdutoJson(
  id: string,
  patch: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; erro: string; status: number }> {
  try {
    const r = await fetchWithAdminAuthRetry(
      `${apiOrigin()}/produtos/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
      { 'Content-Type': 'application/json', Accept: 'application/json' }
    )
    const data: unknown = await r.json().catch(() => ({}))
    if (!r.ok) {
      return { ok: false, erro: httpErroMessage(r, data), status: r.status }
    }
    return { ok: true, data }
  } catch {
    return { ok: false, erro: 'Sem conexão com a API', status: 0 }
  }
}

export async function deleteProduto(id: string): Promise<boolean> {
  try {
    const r = await fetchWithAdminAuthRetry(
      `${apiOrigin()}/produtos/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      { Accept: 'application/json' }
    )
    return r.ok || r.status === 204
  } catch {
    return false
  }
}

export async function postPedidoJson(
  body: Record<string, unknown>
): Promise<
  | { ok: true; orderId?: string; numero?: string }
  | { ok: false; erro: string; status: number }
> {
  try {
    const r = await fetch(`${apiOrigin()}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    })
    const data: unknown = await r.json().catch(() => ({}))
    if (!r.ok) {
      return { ok: false, erro: httpErroMessage(r, data), status: r.status }
    }
    const d = data as { orderId?: string; numero?: string }
    return {
      ok: true,
      orderId: typeof d.orderId === 'string' ? d.orderId : undefined,
      numero: typeof d.numero === 'string' ? d.numero : undefined
    }
  } catch {
    return { ok: false, erro: 'Sem conexão com a API', status: 0 }
  }
}

/**
 * Upload de arquivos para o servidor (multipart, campo `arquivos`).
 * Em dev o Vite faz proxy de `/upload` para a API.
 */
export async function postUploadArquivos(files: File[]): Promise<{ ok: true; urls: string[] } | { ok: false; erro: string }> {
  if (!files.length) return { ok: false, erro: 'Nenhum arquivo' }
  const mkFd = () => {
    const fd = new FormData()
    for (const f of files) fd.append('arquivos', f)
    return fd
  }
  try {
    let r = await fetch(`${apiOrigin()}/upload`, { method: 'POST', headers: withAdmin({}), body: mkFd() })
    if (r.status === 401) {
      clearAdminJwt()
      r = await fetch(`${apiOrigin()}/upload`, { method: 'POST', headers: withAdmin({}), body: mkFd() })
    }
    const data = (await r.json().catch(() => ({}))) as { urls?: string[]; erro?: string }
    if (!r.ok) return { ok: false, erro: httpErroMessage(r, data) }
    if (!Array.isArray(data.urls)) return { ok: false, erro: 'Resposta inválida' }
    const origin = apiOrigin()
    const urls = data.urls.map((u) => (u.startsWith('http') ? u : `${origin || ''}${u}`))
    return { ok: true, urls }
  } catch {
    return { ok: false, erro: 'Sem conexão com a API' }
  }
}
