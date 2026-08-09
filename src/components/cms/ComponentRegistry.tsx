import React from "react";
import { HeroBanner } from "./HeroBanner";
import { RichText } from "./RichText";
// Import other components as they are built...

export interface CmsBlockData {
  id: string;
  type: string;
  props: Record<string, any>;
  visibility?: {
    device?: "all" | "mobile" | "desktop";
    schedule?: { from: string; to: string };
  };
}

const registry: Record<string, React.ComponentType<any>> = {
  HeroBanner: HeroBanner,
  RichText: RichText,
  // ProductGrid: ProductGrid,
};

export function ComponentRegistry({ blocks }: { blocks: CmsBlockData[] }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <>
      {blocks.map((block) => {
        // Handle visibility rules
        if (block.visibility?.device === "mobile") {
          // This should ideally be handled via CSS classes like md:hidden
        }
        
        if (block.visibility?.schedule) {
          const now = new Date();
          const from = new Date(block.visibility.schedule.from);
          const to = new Date(block.visibility.schedule.to);
          if (now < from || now > to) return null;
        }

        const Component = registry[block.type];
        
        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            return (
              <div key={block.id} className="p-4 border-2 border-dashed border-red-500 text-red-500">
                Unknown component type: {block.type}
              </div>
            );
          }
          return null;
        }

        return <Component key={block.id} {...block.props} />;
      })}
    </>
  );
}
