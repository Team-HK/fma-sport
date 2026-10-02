import { TOTP, Secret } from "otpauth";

const ISSUER = "FMA SPORT";

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

function buildTotp(secret: string, label: string) {
  return new TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
}

export function totpUri(secret: string, label: string): string {
  return buildTotp(secret, label).toString();
}

export function verifyTotpCode(secret: string, label: string, code: string): boolean {
  const totp = buildTotp(secret, label);
  // window: 1 tolerates one 30s step of clock drift on the authenticator device
  const delta = totp.validate({ token: code.trim(), window: 1 });
  return delta !== null;
}
