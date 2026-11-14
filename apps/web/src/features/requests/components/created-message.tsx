"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { CREATED_PARAM } from "@/features/requests/constants";

// The tokens of the messages that this browser tab showed. If the page renders
// again with the same token, the message does not show again.
const shownTokens = new Set<string>();

type CreatedMessageProps = {
  // A new token for each saved Request, from the created search param.
  token: string;
};

// Shows the success message one time after a new Request is saved.
export function CreatedMessage({ token }: CreatedMessageProps) {
  const [visible, setVisible] = useState(() => !shownTokens.has(token));
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useLayoutEffect(() => {
    clearTimeout(hideTimer.current);
    shownTokens.add(token);

    // Remove the created param, so a reload does not show the message again.
    // window.history.replaceState changes the URL with no new render.
    const url = new URL(window.location.href);
    if (url.searchParams.has(CREATED_PARAM)) {
      url.searchParams.delete(CREATED_PARAM);
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    }

    return () => {
      // With Cache Components, Next.js hides a page with React <Activity> when
      // the user goes to another page, and shows it again on Back. The cleanup
      // runs when the page is hidden, so the message is gone on Back.
      // Strict Mode (development) runs this cleanup and the setup again at
      // once. The setup then cancels the timer, so the message stays.
      hideTimer.current = setTimeout(() => setVisible(false), 0);
    };
  }, [token]);

  if (!visible) return null;

  return (
    <p
      role="status"
      className="rounded-lg border px-4 py-3 text-sm font-medium"
    >
      Your request was created.
    </p>
  );
}
