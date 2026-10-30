// Password rules for administrators (pure: usable from server actions and tests).
export const MIN_PASSWORD_LENGTH = 12;

/** Returns a French error message when the password is too weak, otherwise null. */
export function passwordWeakness(password: string, email: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  if (password.length > 128) return "Le mot de passe est trop long (128 caractères maximum).";
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 3) return "Mélangez au moins 3 types de caractères : minuscules, majuscules, chiffres, symboles.";
  const lower = password.toLowerCase();
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (lower.includes(email.toLowerCase()) || (local.length >= 4 && lower.includes(local))) {
    return "Le mot de passe ne doit pas contenir votre adresse e-mail.";
  }
  if (/^(.)\1+$/.test(password) || /(password|motdepasse|fmasport|123456|azerty|qwerty)/i.test(password)) {
    return "Ce mot de passe est trop prévisible. Choisissez-en un autre.";
  }
  return null;
}

