import { HttpError, type Env } from './shared';

type AccessJwk = JsonWebKey & { kid?: string };
const signingKeys = new Map<
  string,
  { keys: AccessJwk[]; expires: number; fetchedAt: number }
>();

function decodeSegment(segment: string): Uint8Array<ArrayBuffer> {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment))
    throw new Error('Invalid token encoding');
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}
function decodeObject(segment: string): Record<string, unknown> {
  const value: unknown = JSON.parse(
    new TextDecoder('utf-8', { fatal: true }).decode(decodeSegment(segment)),
  );
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid token object');
  return value as Record<string, unknown>;
}
async function getSigningKey(issuer: string, kid: string): Promise<AccessJwk> {
  const now = Date.now();
  let cached = signingKeys.get(issuer);
  const known = cached?.keys.find((key) => key.kid === kid);
  // Refresh on key rotation, with a short throttle for unknown key identifiers.
  if (
    !cached ||
    cached.expires <= now ||
    (!known && now - cached.fetchedAt > 5_000)
  ) {
    const response = await fetch(`${issuer}/cdn-cgi/access/certs`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error('Signing keys unavailable');
    const body = (await response.json()) as { keys?: AccessJwk[] };
    if (!Array.isArray(body.keys) || body.keys.length > 32)
      throw new Error('Invalid signing keys');
    cached = { keys: body.keys, expires: now + 3_600_000, fetchedAt: now };
    signingKeys.set(issuer, cached);
  }
  const key = cached.keys.find(
    (item) =>
      item.kid === kid &&
      item.kty === 'RSA' &&
      (!item.use || item.use === 'sig') &&
      (!item.alg || item.alg === 'RS256'),
  );
  if (!key) throw new Error('Unknown signing key');
  return key;
}

/** Validate Access signature and claims; the forwarding header alone is not authorization. */
export async function requireOwner(request: Request, env: Env): Promise<void> {
  const url = new URL(request.url);
  if (
    env.LOCAL_OWNER_PREVIEW === 'true' &&
    url.protocol === 'http:' &&
    ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  )
    return;

  const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
  const team = env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const audience = env.CF_ACCESS_AUD?.trim();
  if (
    !ownerEmail ||
    !/^[^\s@*]+@[^\s@*]+\.[^\s@*]+$/.test(ownerEmail) ||
    !team ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/i.test(team) ||
    !audience
  ) {
    throw new HttpError(
      503,
      'The private inbox has not been configured for owner access.',
    );
  }
  const issuer = `https://${team.toLowerCase()}`;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 16_384)
    throw new HttpError(
      401,
      'Sign in through Cloudflare Access to open the private inbox.',
    );
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const [encodedHeader, encodedClaims, encodedSignature] = parts;
    const header = decodeObject(encodedHeader);
    if (
      header.alg !== 'RS256' ||
      typeof header.kid !== 'string' ||
      header.kid.length > 200 ||
      header.crit !== undefined
    )
      throw new Error('Unsupported token');
    const jwk = await getSigningKey(issuer, header.kid);
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      decodeSegment(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`),
    );
    if (!valid) throw new Error('Invalid signature');
    const claims = decodeObject(encodedClaims);
    const now = Math.floor(Date.now() / 1000);
    const audiences =
      typeof claims.aud === 'string' ? [claims.aud] : claims.aud;
    if (
      claims.iss !== issuer ||
      !Array.isArray(audiences) ||
      !audiences.includes(audience) ||
      typeof claims.exp !== 'number' ||
      !Number.isFinite(claims.exp) ||
      claims.exp <= now ||
      (claims.nbf !== undefined &&
        (typeof claims.nbf !== 'number' ||
          !Number.isFinite(claims.nbf) ||
          claims.nbf > now)) ||
      typeof claims.email !== 'string' ||
      claims.email.trim().toLowerCase() !== ownerEmail
    )
      throw new Error('Invalid authorization claims');
  } catch {
    throw new HttpError(
      403,
      'Owner access could not be verified. Sign in again through Cloudflare Access.',
    );
  }
}
