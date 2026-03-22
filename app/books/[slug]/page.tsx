import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getBookBySlug } from '@/lib/actions/book.actions';

export default async function BookDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

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

      <div className="vapi-main-container mx-auto w-full max-w-4xl space-y-8">
        {/* Header Card */}
        <div className="vapi-header-card w-full">
          {/* Cover & Mic Button */}
          <div className="vapi-cover-wrapper">
            <Image
              src={
                book.coverURL || 'https://placehold.co/400x600?text=No+Cover'
              }
              alt={book.title}
              width={162}
              height={240}
              className="vapi-cover-image"
            />
            <div className="vapi-mic-wrapper">
              <button className="vapi-mic-btn vapi-mic-btn-inactive">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12H3a9 9 0 0 0 11.5 8.81" />
                  <line x1="12" y1="21" x2="12" y2="22" />
                </svg>
              </button>
            </div>
          </div>

          {/* Book Details */}
          <div className="flex flex-1 flex-col pl-2">
            <h1 className="book-title-lg">{book.title}</h1>
            <p className="subtitle mb-6">by {book.author}</p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready"></span>
                <span className="vapi-status-text">Ready</span>
              </div>

              <div className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">
                  Voice: {book.persona || 'Daniel'}
                </span>
              </div>

              <div className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">0:00/15:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Area */}
        <div className="transcript-container shadow-soft">
          <div className="transcript-empty">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 text-[#8B7355] opacity-70"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <h2 className="transcript-empty-text">No conversation yet</h2>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
