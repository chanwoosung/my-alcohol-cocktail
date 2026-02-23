"use client";

import React, { useEffect } from "react";

export default function ServiceWorkerLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const setup = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (process.env.NODE_ENV !== "production") {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
          return;
        }

        await Promise.all(
          registrations
            .filter((registration) => registration.active?.scriptURL.includes("/service-worker.js"))
            .map((registration) => registration.unregister()),
        );

        // next-pwa handles registration on production builds.
      } catch (error) {
        console.error("Service Worker setup failed:", error);
      }
    };

    void setup();
  }, []);

  return (
    <>
      {children}
    </>
  );
}
