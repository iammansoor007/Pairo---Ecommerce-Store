import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import Staff from "@/models/Staff";
import Customer from "@/models/Customer";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Type", type: "text" } // 'staff' or 'customer'
      },
      async authorize(credentials) {
        await dbConnect();

        // 1. Staff Authentication
        if (credentials.loginType === 'staff') {
            const staff = await Staff.findOne({ email: credentials.email }).populate('roleId').lean();
            if (!staff || staff.status !== 'Active') {
                throw new Error(staff?.status === 'Suspended' ? "Account suspended" : "Invalid staff credentials");
            }

            const isMatch = await bcrypt.compare(credentials.password, staff.password);
            if (!isMatch) {
                // TODO: Increment failed attempts and lock account logic
                throw new Error("Invalid staff credentials");
            }

            return { 
                id: staff._id.toString(), 
                name: staff.name, 
                email: staff.email, 
                role: staff.roleId, // Populated Role object with permissions Map
                isStaff: true 
            };
        }

        // 2. Customer Authentication
        const customer = await Customer.findOne({ email: credentials.email }).lean();
        if (!customer) {
          throw new Error("No customer found with this email");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, customer.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return { id: customer._id.toString(), name: customer.name, email: customer.email, isStaff: false };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isStaff = user.isStaff;
        if (user.isStaff) {
            token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isStaff = token.isStaff;
        if (token.isStaff) {
            session.user.role = token.role;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
