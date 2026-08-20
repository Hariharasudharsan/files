import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { prisma } from "@/lib/infrastructure/database/prisma";
import WishlistList from "./WishlistList";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/account/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/account/login");
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: {
                include: {
                  primaryImage: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const items = wishlist?.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-surface-950">My Wishlist</h1>
        <p className="text-surface-900/60 mt-2">Manage your saved items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <main className="md:col-span-4 lg:col-span-3">
          <WishlistList initialItems={items} />
        </main>
      </div>
    </div>
  );
}
