import React from "react";

interface RichTextProps {
  htmlContent: string;
  contained?: boolean;
}

export function RichText({ htmlContent, contained = true }: RichTextProps) {
  const containerClass = contained ? "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16" : "w-full";
  
  return (
    <div className={containerClass}>
      <div 
        className="prose prose-lg prose-surface max-w-none prose-headings:font-display prose-a:text-primary-600 hover:prose-a:text-primary-700"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
