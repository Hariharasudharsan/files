import CheckoutClient from "./CheckoutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/modules/auth/infrastructure/authOptions";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  
  return <CheckoutClient initialUser={session?.user as any} />;
}
