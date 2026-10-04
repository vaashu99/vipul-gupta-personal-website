import { requireOwner } from './auth';
import { handleChat, handleInbox } from './chat';
import { handleReactions } from './reactions';
import {
  HttpError,
  getVisitor,
  json,
  privateError,
  requireSameOriginPOST,
  withVisitorCookie,
  type Env,
} from './shared';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let pathname: string;
    try {
      const decoded = decodeURIComponent(url.pathname).replace(/\\/g, '/');
      // Mirror common static-asset normalization before deciding authorization.
      const segments: string[] = [];
      for (const segment of decoded.split('/')) {
        if (segment === '..') segments.pop();
        else if (segment && segment !== '.') segments.push(segment);
      }
      pathname = '/' + segments.join('/');
    } catch {
      return privateError('This address could not be read.', 400);
    }
    const isInboxAPI =
      pathname === '/api/inbox' || pathname.startsWith('/api/inbox/');
    const isInboxPage =
      pathname === '/inbox' ||
      pathname === '/inbox.html' ||
      pathname.startsWith('/inbox/');
    try {
      if (isInboxAPI || isInboxPage) await requireOwner(request, env);
      if (isInboxPage) {
        const asset = await env.ASSETS.fetch(request);
        const headers = new Headers(asset.headers);
        headers.set('Cache-Control', 'private, no-store');
        headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        headers.set('Referrer-Policy', 'no-referrer');
        headers.set('X-Frame-Options', 'DENY');
        return new Response(asset.body, { status: asset.status, headers });
      }
      if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
      requireSameOriginPOST(request);
      if (pathname === '/api/health') {
        if (request.method !== 'GET')
          return json({ message: 'Use GET for service status.' }, 405, {
            Allow: 'GET',
          });
        return json({
          storageConfigured: Boolean(env.SITE_DB),
          mode:
            env.LOCAL_OWNER_PREVIEW === 'true' ? 'local-preview' : 'configured',
        });
      }
      if (isInboxAPI) return await handleInbox(request, env);
      const visitor = getVisitor(request);
      let response: Response;
      if (pathname === '/api/reactions')
        response = await handleReactions(request, env, visitor);
      else if (pathname === '/api/chat')
        response = await handleChat(request, env, visitor);
      else return privateError('This endpoint could not be found.', 404);
      return withVisitorCookie(response, request, visitor);
    } catch (error) {
      if (error instanceof HttpError)
        return privateError(error.message, error.status);
      // Never leak database details, messages or authorization tokens to logs/responses.
      return privateError(
        'This service is temporarily unavailable. Please try again later.',
        503,
      );
    }
  },
};
