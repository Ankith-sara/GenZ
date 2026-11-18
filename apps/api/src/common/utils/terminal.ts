// Tiny ANSI helpers shared by the startup output and the dev request log.
// Colors only appear in a real terminal, and never when NO_COLOR is set.
const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

const paint = (code: string) => (text: string) =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

export const bold = paint("1");
export const dim = paint("90");
export const red = paint("31");
export const green = paint("32");
export const yellow = paint("33");
export const cyan = paint("36");
export const amber = paint("38;5;214");