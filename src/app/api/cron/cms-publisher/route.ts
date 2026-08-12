import { NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/database/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const pagesToPublish = await prisma.cmsPage.findMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: new Date(),
        },
      },
    });

    for (const page of pagesToPublish) {
      await prisma.cmsPage.update({
        where: { id: page.id },
        data: { status: 'PUBLISHED' },
      });

      revalidatePath('/', 'layout');
      revalidatePath('/admin/cms/pages');
      revalidatePath(`/${page.slug}`);
    }

    return NextResponse.json({ success: true, count: pagesToPublish.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
