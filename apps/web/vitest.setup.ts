import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Remove the rendered DOM after each test. Vitest globals are off, so Testing Library does not do this itself.
afterEach(() => {
  cleanup();
});
