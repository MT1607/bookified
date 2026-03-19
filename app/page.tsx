import React from 'react';
import Hero from '@/components/Hero';
import { sampleBooks } from '@/lib/contants';
import BookCard from '@/components/BookCard';
import { getAllBooks } from '@/lib/actions/book.actions';

async function Page() {
  const bookResult = await getAllBooks();
  const books = bookResult.success ? (bookResult.data ?? []) : [];

  return (
    <main className="">
      <Hero />
      <div className="wrapper library-books-grid mb-10">
        {books.map((book) => (
          <BookCard key={book._id} {...book} />
        ))}
      </div>
    </main>
  );
}

export default Page;
