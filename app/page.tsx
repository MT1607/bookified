import React from 'react';
import Hero from '@/components/Hero';
import { sampleBooks } from '@/lib/contants';
import BookCard from '@/components/BookCard';

function Page() {
  return (
    <main className="">
      <Hero />
      <div className="wrapper library-books-grid mb-10">
        {sampleBooks.map((book) => (
          <BookCard key={book._id} {...book} />
        ))}
      </div>
    </main>
  );
}

export default Page;
