export function validateLoginEmail(email: string): string | null {
  if (!email.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Please enter a valid email address (e.g. user@example.com).";
  }
  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}
