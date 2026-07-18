"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function generateSessionId(): string {
  let sid = sessionStorage.getItem("pr_session");
  if (!sid) {
    sid = "s-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem("pr_session", sid);
  }
  return sid;
}

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPageRef = useRef<string>("");
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (pathname === lastPageRef.current) return;
    lastPageRef.current = pathname;

    const sendVisit = async () => {
      try {
        await fetch("/api/public-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: pathname,
            referrer: document.referrer || null,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
            sessionId: generateSessionId(),
          }),
        });
      } catch {
        // Tracking failure is non-critical
      }
    };

    sendVisit();

    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (navigator.sendBeacon) {
        const blob = new Blob(
          [JSON.stringify({ sessionId: generateSessionId(), duration })],
          { type: "application/json" }
        );
        navigator.sendBeacon("/api/public-records/duration", blob);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    startTimeRef.current = Date.now();

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [pathname]);

  return null;
}
