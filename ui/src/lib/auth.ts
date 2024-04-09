
import { SignJWT, jwtVerify } from 'jose';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  // Secret for Next-auth, without this JWT encryption/decryption won't work
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    async encode(params) {
      const jwt = await new SignJWT(params.token)
        .setProtectedHeader({ alg: 'HS256' }) // HS256 algorithm for HMAC with SHA-256
        .setIssuedAt()
        .setExpirationTime('2h') // Sets the expiration time of the JWT (e.g., 2 hours from now)
        .sign(new TextEncoder().encode(params.secret.toString()));
      return jwt
    },
    async decode(params) {
      const key = new TextEncoder().encode(params.secret.toString());
      const { payload } = await jwtVerify(params.token || "{}", key, {
        algorithms: ['HS256'],
      });

      return payload;
    },
  },
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_ID as string,
      clientSecret: process.env.GOOGLE_AUTH_SECRET as string,
    }),
  ],
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }