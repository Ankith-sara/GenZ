import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock server-only package so server utilities can be tested in jsdom test runner
vi.mock("server-only", () => ({}));
