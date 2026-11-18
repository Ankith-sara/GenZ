import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const otpSendSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(6).max(8),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  fullName: z.string().min(2).max(100),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6),
  password: z.string().min(8),
});

export const passwordUpdateSchema = z.object({
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OtpSendInput = z.infer<typeof otpSendSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
