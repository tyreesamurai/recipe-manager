import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

// @ts-expect-error — ServiceWorkerGlobalScope is defined in the service worker context
declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  } & SerwistGlobalConfig;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // API routes must never be cached — always go straight to the network.
    // defaultCache applies NetworkFirst with a 10s timeout and 24h cache to
    // all /api/* GET requests, which causes stale or empty cached responses
    // to be served when the timeout fires. NetworkOnly bypasses this entirely.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
