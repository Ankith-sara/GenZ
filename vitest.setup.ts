import { vi } from "vitest";

// Mock server-only package so server utilities can be tested in test runner
vi.mock("server-only", () => ({}));

// Provide deterministic fallback test credentials for CI runners
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
process.env.RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
