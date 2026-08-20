import { prisma } from "@/lib/infrastructure/database/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories of Goodness | Mathuram Foods",
  description: "Authentic stories behind Mathuram Foods, our heritage, and our ingredients.",
};

export default async function StoriesPage() {
  const stories = await prisma.cmsPage.findMany({
    where: {
      type: "STORY",
      status: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return (
    <div className="bg-surface-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-surface-950 mb-4">
            Stories of Goodness
          </h1>
          <p className="text-lg text-surface-600 max-w-2xl mx-auto">
            Discover the heritage, authentic processes, and real people behind Mathuram Foods.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-surface-200 shadow-sm">
            <BookOpen className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">More stories coming soon</h3>
            <p className="text-surface-500">We are busy gathering stories from our heritage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Link 
                key={story.id} 
                href={`/stories/${story.slug}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-surface-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-64 bg-surface-200 overflow-hidden">
                  {story.featuredImage ? (
                    <img 
                      src={story.featuredImage} 
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50">
                      <BookOpen className="w-12 h-12 text-primary-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-primary-900 text-xs font-bold rounded-full shadow-sm">
                      {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-surface-950 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-surface-600 mb-6 line-clamp-3 flex-1">
                    {story.excerpt || "Read the full story..."}
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold text-sm mt-auto">
                    Read Story
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
