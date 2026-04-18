import helmet from 'helmet'

/**
 * Cabeçalhos de segurança (Helmet) na API Express.
 *
 * O front em dev (Vite) é outra origem: `Cross-Origin-Resource-Policy: cross-origin`
 * evita bloquear imagens em `/uploads` e respostas JSON no `fetch`.
 *
 * CSP restritiva só para recursos da própria API (JSON / arquivos); o HTML do Vite
 * não é servido por este servidor, então o HMR e scripts do Vite não são afetados.
 */
export function createSecurityMiddleware() {
  if (String(process.env.HELMET_DISABLE || '').toLowerCase() === 'true') {
    return (_req, _res, next) => next()
  }

  const prod = process.env.NODE_ENV === 'production'

  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts:
      prod && String(process.env.HELMET_HSTS || '').toLowerCase() !== 'false'
        ? { maxAge: 15552000, includeSubDomains: true, preload: false }
        : false
  })
}
