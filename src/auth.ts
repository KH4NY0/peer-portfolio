// NextAuth is disabled. We use Clerk for authentication.
// This file remains to avoid breaking imports if any are left behind.
export const authOptions = undefined as never;
export const getAuthSession = async (): Promise<null> => null;
export default function noop() { return null as any; }
