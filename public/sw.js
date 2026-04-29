// Service Worker — Biết Tiếng Việt PWA
// Strategy:
//   • Static assets (JS/CSS/fonts/SVG) → Cache-first, refresh in background
//   • TTS audio files → Cache-first, long TTL
//   • API routes (auth, lessons, realtime) → Network-only
//   • App pages → Network-first with offline fallback
const CACHE_NAME = "biet-tieng-viet-v1";
const AUDIO_CACHE = "biet-tieng-viet-audio-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = ["/", "/offline", "/manifest.webmanifest", "/icon.svg"];

// ── Install: precache shell pages ─────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Never intercept: auth, supabase, API mutations, realtime
  if (
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/api/tts") === false && url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co") ||
    request.method !== "GET"
  ) {
    return;
  }

  // TTS audio → cache-first, long-lived
  if (url.pathname.startsWith("/api/tts")) {
    e.respondWith(audioCacheFirst(request));
    return;
  }

  // Static assets (Next.js chunks, fonts) → cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest")
  ) {
    e.respondWith(cacheFirst(request));
    return;
  }

  // App pages → network-first with offline fallback
  if (request.mode === "navigate") {
    e.respondWith(networkFirstWithFallback(request));
    return;
  }
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title ?? "Biết Tiếng Việt", {
      body: data.body ?? "Time to practice Vietnamese!",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: data.tag ?? "streak-reminder",
      data: { url: data.url ?? "/learn" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? "/learn";
  e.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(url));
        return existing ? existing.focus() : self.clients.openWindow(url);
      })
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function audioCacheFirst(request) {
  const cached = await caches.match(request, { cacheName: AUDIO_CACHE });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(AUDIO_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match(OFFLINE_URL);
    return fallback ?? new Response("Offline", { status: 503 });
  }
}
