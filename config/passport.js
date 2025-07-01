// config/passport.js
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import passport from "passport";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Extra verification: Only allow users with a specific email domain
      const allowedDomain = "gmail.com"; // Change this to your allowed domain
      const userEmail = profile.emails[0].value;
      if (!userEmail.endsWith(`@${allowedDomain}`)) {
        // Fail authentication if not allowed
        return done(null, false, { message: "Unauthorized domain" });
      }
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            googleId: profile.id,
            name: profile.displayName,
            avatar: profile.photos[0].value,
          },
        });
      }
      done(null, user);
    }
  )
);
