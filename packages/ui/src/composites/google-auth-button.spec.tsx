import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GoogleAuthButton } from "./google-auth-button";

describe("GoogleAuthButton", () => {
  it("renders with default text when idle", () => {
    render(<GoogleAuthButton text="Sign in with Google" />);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.textContent).toContain("Sign in with Google");
    expect(button.disabled).toBe(false);
  });

  it("renders loading text and disabled state when loading is true", () => {
    render(
      <GoogleAuthButton
        loading={true}
        loadingText="Connecting to Google..."
        text="Sign in with Google"
      />
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain("Connecting to Google...");
  });

  it("fires onClick handler when clicked in normal state", () => {
    const handleClick = vi.fn();
    render(<GoogleAuthButton onClick={handleClick} text="Continue" />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
