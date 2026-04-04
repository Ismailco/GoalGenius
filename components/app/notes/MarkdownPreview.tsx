'use client';

import DOMPurify from 'dompurify';
import { renderMarkdownToHtml } from '@/lib/markdown';

interface MarkdownPreviewProps {
  content: string;
  emptyMessage?: string;
}

export default function MarkdownPreview({
  content,
  emptyMessage = 'Start writing to preview your note.',
}: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  const renderedHtml = renderMarkdownToHtml(content);
  const sanitizedHtml =
    typeof window === 'undefined'
      ? renderedHtml
      : DOMPurify.sanitize(renderedHtml);

  return (
    <div
      className="h-full overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-sm leading-7 text-gray-200
        [&_a]:text-blue-300 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400/40 [&_blockquote]:pl-4
        [&_blockquote]:italic [&_blockquote]:text-gray-300 [&_code]:rounded-md [&_code]:bg-white/10 [&_code]:px-1.5
        [&_code]:py-0.5 [&_del]:text-gray-500 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-white
        [&_h1:first-child]:mt-0 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white
        [&_h2:first-child]:mt-0 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white
        [&_h3:first-child]:mt-0 [&_hr]:my-6 [&_hr]:border-white/10 [&_input]:mr-2 [&_input]:accent-blue-400
        [&_li]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-4 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl
        [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre_code]:bg-transparent
        [&_pre_code]:p-0 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:ml-5 [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
