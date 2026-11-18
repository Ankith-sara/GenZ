export function validateLoginEmail(email: string): string | null {
  if (!email.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Please enter a valid email address (e.g. user@example.com).";
  }
  return null;
}

export function validateLoginCompanyName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Company name is required.";
  if (trimmed.length < 2) {
    return "Company name must be at least 2 characters.";
  }
  return null;
}

export function validateLoginIdentifier(identifier: string): string | null {
  const trimmed = identifier.trim();
  if (!trimmed) return "Company name or email is required.";
  if (trimmed.includes("@")) {
    return validateLoginEmail(trimmed);
  }
  if (trimmed.length < 2) {
    return "Company name must be at least 2 characters.";
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
