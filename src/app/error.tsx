"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    logger.error(error);
  }, [error]);

  return (
    <div>
      <h1>Something went wrong</h1>

      <p>
        Please try again. If it keeps happening, it might be a temporary issue.
      </p>

      {process.env.NODE_ENV !== "production" ? (
        <pre>
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
      ) : null}

      <div>
        <button type="button" onClick={reset}>
          Try again
        </button>

        <a href="/">Go home</a>
      </div>
    </div>
  );
}
