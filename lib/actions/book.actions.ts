'use server';
import { auth } from '@clerk/nextjs/server';
import { getUserPlan, checkBookLimit } from '../utils/subscription';
import { connectToDatabase } from '@/database/mongoose';
import { CreateBook, TextSegment } from '@/type';
import { success } from 'zod';
import { generateSlug, serializeData } from '../utils';
import Book from '@/database/models/books.model';
import BookSegment from '@/database/models/book-segment.model';

export const getAllBooks = async () => {
  try {
    await connectToDatabase();

    const books = await Book.find().sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: serializeData(books),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error,
    };
  }
};

export const checkBookExist = async (title: string) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook),
      };
    }

    return {
      exists: false,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error,
    };
  }
};

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        alreadyExists: true,
      };
    }

    const { has } = await auth();
    const userPlan = getUserPlan(has);
    const existingBooksCount = await Book.countDocuments({
      clerkId: data.clerkId,
    });
    const limitCheck = checkBookLimit(existingBooksCount, userPlan);

    console.log('limit check: ', limitCheck);

    if (!limitCheck.allowed) {
      console.error('user plan: ', userPlan);
      return {
        success: false,
        error: `Book limit reached for your ${userPlan} plan. Please upgrade to add more books.`,
      };
    }

    const book = await Book.create({
      ...data,
      slug,
      totalSegments: data.totalSegments || 0,
    });

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error,
    };
  }
};

export const saveBookSegments = async (
  bookId: string,
  segments: TextSegment[],
  clerkId: string
) => {
  try {
    await connectToDatabase();

    console.log('Saving book segments ... ');

    const segmentToInsert = segments.map((segment) => ({
      ...segment,
      bookId,
      clerkId,
      content: segment.text,
    }));

    await BookSegment.insertMany(segmentToInsert);

    await Book.findByIdAndUpdate(bookId, {
      totalSegments: segments.length,
    });

    console.log('Saved book segments successfully');

    return {
      success: true,
      data: serializeData(segmentToInsert),
    };
  } catch (error) {
    console.error(error);
    await BookSegment.deleteMany({ bookId });
    await Book.findByIdAndDelete(bookId);
    console.log(
      'Deleted book segments and book due to failure to save segments'
    );
  }
};

export const getBookBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const book = await Book.findOne({ slug }).lean();

    if (book) {
      return {
        success: true,
        data: serializeData(book),
      };
    }

    return {
      success: false,
      error: 'Book not found',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error,
    };
  }
};

export const searchBookSegments = async (
  bookId: string,
  query: string,
  limit: number = 3
) => {
  try {
    await connectToDatabase();

    console.log('Searching book segments ... ', bookId, query);

    const segments = await BookSegment.find(
      {
        bookId,
        $text: { $search: query },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: serializeData(segments),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error,
    };
  }
};
