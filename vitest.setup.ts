import { vi } from "vitest";

// Mock server-only package so server utilities can be tested in test runner
vi.mock("server-only", () => ({}));

