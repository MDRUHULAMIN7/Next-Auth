import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvidedr from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoClientPromise from "./lib/mongoClinetPromise";
import { userModel } from "./models/user-model";
import { dbConnect } from "./lib/mongo";

export const {
auth,
signIn,
signOut,
handlers:{GET,POST},

}= NextAuth({
  adapter: MongoDBAdapter(mongoClientPromise, {databaseName: process.env.ENVIRONMENT}),
  session: {

    strategy: "jwt",
    
  },
  providers: [
    CredentialsProvidedr({
      credentials:{
        email:{},
        password:{},
      },
      async authorize(credentials){
        if(credentials == null) return null;
        await dbConnect();
        try {
          const user = await userModel.findOne({email: credentials?.email});
          if (user) {
            const isMatch = user?.password === credentials.password;

            if (isMatch) {
              return user;
            } else {
              throw new Error("Email or Password is not correct");
            }
          } else {
            throw new Error("User not found");
          }
        } catch (error) {
          throw new Error(error);
        }

      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    

  ],
  
})