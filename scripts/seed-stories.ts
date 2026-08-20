import { prisma } from '../src/lib/infrastructure/database/prisma';
import { remark } from 'remark';
import html from 'remark-html';

async function main() {
  console.log("Seeding stories...");

  const stories = [
    {
      title: "The Art of Sun-Drying: Why Weather Matters",
      slug: "sun-drying-process",
      type: "STORY",
      status: "PUBLISHED",
      excerpt: "Sun-drying is at the heart of our traditional papadam, vadam, and appalam making process. Learn why weather plays a critical role in preserving authenticity.",
      featuredImage: "https://images.unsplash.com/photo-1627464010874-958b1a37cce1?q=80&w=1200&auto=format&fit=crop", // placeholder image mimicking Indian food/spices
      publishedAt: new Date(),
      markdown: `## The Heritage of Sun-Drying

At Mathuram Foods, our commitment to authenticity means we rely on traditional methods. For our papadams, vadams, and appalams, **sun-drying** isn't just a step in the recipe—it's an essential ingredient.

### Why Sun-Drying?

Unlike machine dehydration, natural sun-drying allows the dough to cure slowly. The direct sunlight naturally evaporates moisture while enhancing the inherent flavors of our urad dal and spices. This slow curing process is what gives our appalams their signature crispiness and extended shelf life without the need for artificial preservatives.

### The Regional Differences

*   **Appalam (Tamil Nadu):** Traditionally uses urad dal, offering a lighter, airier crisp when fried.
*   **Papadam (Kerala):** Often uses a mix of flours and incorporates coconut oil into the dough.
*   **Vadam:** A sun-dried summer staple, often made from rice flour, sago, or onion pastes, providing a harder crunch.

Each variation requires careful attention to the weather. We plan our major production cycles around the harsh summer sun to ensure every batch is dried to perfection.`
    },
    {
      title: "Janaki Paati's Store: A Legacy of Flavor",
      slug: "janaki-paatis-legacy",
      type: "STORY",
      status: "PUBLISHED",
      excerpt: "Meet Janaki Paati, the matriarch whose decades-old recipes and unwavering standards form the foundation of our premium product line.",
      featuredImage: "https://images.unsplash.com/photo-1596541604085-f55db6f5fcf1?q=80&w=1200&auto=format&fit=crop", 
      publishedAt: new Date(),
      markdown: `## The Woman Behind the Recipes

Janaki Paati wasn't just a grandmother; she was the culinary cornerstone of our family. The specific product line named after her—**"Janaki Paati's Store"**—is a direct homage to her original, uncompromised recipes.

### What Makes Her Recipes Special?

Janaki Paati believed that the secret to truly memorable food wasn't complexity, but the uncompromising quality of ingredients and patience in preparation. Her recipes demand:

1.  **Hand-pounded Spices:** Never machine-ground, to retain the essential oils.
2.  **Small Batches:** Ensuring every mix receives the attention it deserves.
3.  **Generational Instinct:** Knowing exactly when a dough is ready just by the feel of it.

Every time you open a product from Janaki Paati's Store, you are experiencing the exact flavors we grew up with. We haven't changed a thing, because perfection doesn't need updating.`
    }
  ];

  for (const story of stories) {
    const existing = await prisma.cmsPage.findUnique({ where: { slug: story.slug } });
    if (!existing) {
      const processedContent = await remark().use(html).process(story.markdown);
      const htmlContent = processedContent.toString();

      const blocks = [
        {
          id: Date.now().toString(),
          type: "RichText",
          props: { htmlContent, rawMarkdown: story.markdown }
        }
      ];

      const page = await prisma.cmsPage.create({
        data: {
          title: story.title,
          slug: story.slug,
          type: story.type,
          status: story.status,
          excerpt: story.excerpt,
          featuredImage: story.featuredImage,
          publishedAt: story.publishedAt,
        }
      });

      const version = await prisma.cmsPageVersion.create({
        data: {
          pageId: page.id,
          version: 1,
          content: blocks,
        }
      });

      await prisma.cmsPage.update({
        where: { id: page.id },
        data: { activeVersionId: version.id }
      });

      console.log("Created story: " + story.title);
    } else {
      console.log("Story already exists: " + story.title);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
