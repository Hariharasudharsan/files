import { prisma } from "@/lib/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import EditZoneClient from "./EditZoneClient";

export default async function EditShippingZonePage({ params }: { params: { id: string } }) {
  const zone = await prisma.shippingZone.findUnique({
    where: { id: params.id },
    include: {
      pincodes: {
        select: { pincode: true }
      }
    }
  });

  if (!zone) return notFound();

  // Extract just the string array
  const currentPincodes = zone.pincodes.map(p => p.pincode);

  return <EditZoneClient zone={zone} currentPincodes={currentPincodes} />;
}
