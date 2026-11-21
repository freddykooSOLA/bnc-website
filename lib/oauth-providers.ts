export function googleOAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim());
}

export function facebookOAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_FACEBOOK_ID?.trim() && process.env.AUTH_FACEBOOK_SECRET?.trim());
}

/** Client bundle：由 next.config 在 build 時注入，不含密鑰。 */
export function facebookLoginVisibleOnClient(): boolean {
  return process.env.NEXT_PUBLIC_FACEBOOK_LOGIN_ENABLED === '1';
}