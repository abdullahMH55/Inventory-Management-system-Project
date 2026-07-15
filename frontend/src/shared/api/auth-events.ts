/**
 * A tiny pub/sub so the axios interceptor can report "the session is gone"
 * without importing the store or the router.
 *
 * The interceptor must never navigate. Reaching for a module-level router from
 * inside an interceptor is how you get "navigate called before the router
 * mounted", and it makes the client untestable outside React. Instead the
 * session flips to null and the guard re-renders a <Navigate/>: the redirect is
 * declarative.
 */

type Handler = () => void;

const handlers = new Set<Handler>();

export function onUnauthorized(handler: Handler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function emitUnauthorized(): void {
  for (const handler of handlers) handler();
}
