import CheckoutClient from "./CheckoutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { prisma } from "@/lib/infrastructure/database/prisma";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  
  let prepaidDiscountPercent = 0;
  const flag = await prisma.featureFlag.findUnique({ where: { key: "PREPAID_DISCOUNT" } });
  if (flag?.isEnabled && flag.rules) {
    const rules: any = flag.rules;
    if (rules.percentage) {
      prepaidDiscountPercent = Number(rules.percentage);
    }
  }

  // B2B Logic
  let isB2B = false;
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (dbUser?.isB2B) isB2B = true;
  }

  const b2bFlag = await prisma.featureFlag.findUnique({ where: { key: "b2b_tier" } });
  let b2bMinOrderValue = 0;
  let b2bMinOrderQty = 0;
  if (b2bFlag?.isEnabled && b2bFlag.rules) {
    const bRules: any = b2bFlag.rules;
    if (bRules.minOrderValue) b2bMinOrderValue = Number(bRules.minOrderValue);
    if (bRules.minOrderQty) b2bMinOrderQty = Number(bRules.minOrderQty);
  }
  
  return (
    <CheckoutClient 
      initialUser={session?.user as any} 
      prepaidDiscountPercent={prepaidDiscountPercent} 
      isB2B={isB2B}
      b2bMinOrderValue={b2bMinOrderValue}
      b2bMinOrderQty={b2bMinOrderQty}
    />
  );
}
