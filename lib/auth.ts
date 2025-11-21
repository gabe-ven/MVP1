import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After sign-in, redirect to AI Hub
      if (url.startsWith("/")) {
        return url === "/" ? `${baseUrl}/ai-hub` : url;
      }
      // If callback URL is on same domain, use it
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, redirect to AI Hub
      return `${baseUrl}/ai-hub`;
    },
    async jwt({ token, account, user }) {
      // Store the access token in the JWT token
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      // Store user info in token (on initial sign in)
      // NextAuth automatically populates user.name, user.email, user.image from Google
      if (user) {
        token.name = user.name;
        token.picture = user.image;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the access token to the session
      session.accessToken = token.accessToken as string;
      if (session.user) {
        // Ensure user data is passed from token to session
        session.user.email = (token.email as string) || session.user.email || "";
        session.user.name = (token.name as string) || session.user.name || "";
        session.user.image = (token.picture as string) || session.user.image || "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

