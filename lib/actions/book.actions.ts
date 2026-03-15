'use server';
import { connectToDatabase } from '@/database/mongoose';
import { CreateBook, TextSegment } from '@/type';
import { success } from 'zod';
import { generateSlug, serializeData } from '../utils';
import Book from '@/database/models/books.model';
import BookSegment from '@/database/models/book-segment.model';

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
    // Todo: check subcription limits

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
