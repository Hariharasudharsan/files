import { getApiDocs } from "@/lib/swagger";
import { ReactSwagger } from "@/components/swagger-ui";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container mx-auto p-4 bg-white min-h-screen">
      <ReactSwagger spec={spec} />
    </section>
  );
}
