"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      
      if (
        error &&
        (error.toString().includes("Failed to load chunk") ||
          error.toString().includes("Loading chunk") ||
          error.toString().includes("ChunkLoadError") ||
          event.message?.includes("Failed to fetch dynamically imported module"))
      ) {
        Sentry.captureException(error, {
          tags: {
            errorType: "chunk_load_error",
            recoverable: true,
          },
        });

        const retryDelay = 2000;
        const hasRetried = sessionStorage.getItem("chunkRetryAttempted") === "true";

        if (!hasRetried) {
          sessionStorage.setItem("chunkRetryAttempted", "true");
          setTimeout(() => {
            setTimeout(() => {
              sessionStorage.removeItem("chunkRetryAttempted");
            }, 10000);
            window.location.reload();
          }, retryDelay);
        } else {
          sessionStorage.removeItem("chunkRetryAttempted");
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      if (
        reason &&
        (reason.toString().includes("Failed to load chunk") ||
          reason.toString().includes("Loading chunk") ||
          reason.toString().includes("ChunkLoadError") ||
          reason.toString().includes("Failed to fetch dynamically imported module"))
      ) {
        Sentry.captureException(reason, {
          tags: {
            errorType: "chunk_load_error",
            recoverable: true,
          },
        });

        const hasRetried = sessionStorage.getItem("chunkRetryAttempted") === "true";

        if (!hasRetried) {
          sessionStorage.setItem("chunkRetryAttempted", "true");
          setTimeout(() => {
            setTimeout(() => {
              sessionStorage.removeItem("chunkRetryAttempted");
            }, 10000);
            window.location.reload();
          }, 2000);
        } else {
          sessionStorage.removeItem("chunkRetryAttempted");
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
