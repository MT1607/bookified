import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getBookBySlug } from '@/lib/actions/book.actions';
import VapiControls from '@/components/VapiControls';
import { toast } from 'sonner';

export default async function BookDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  // Await params if using Next.js 15, otherwise it doesn't hurt.
  const resolvedParams = await Promise.resolve(params);
  const result = await getBookBySlug(resolvedParams.slug);

  if (!result.success || !result.data) {
    redirect('/');
  }

  const book = result.data;

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </Link>

      {/* Transcript Area */}
      <VapiControls book={book} />
    </div>
  );
}
