import * as z from 'zod';
import {
  MAX_FILE_SIZE,
  ACCEPTED_PDF_TYPES,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from './contants';

export const bookFormSchema = z.object({
  pdfFile: z
    .any()
    .refine((file) => file instanceof File, 'PDF file is required')
    .refine(
      (file) => file instanceof File && file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => file instanceof File && ACCEPTED_PDF_TYPES.includes(file.type),
      'Only .pdf formats are supported'
    ),
  coverImage: z
    .any()
    .optional()
    .refine(
      (file) => !file || (file instanceof File && file.size <= MAX_IMAGE_SIZE),
      `Image size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) =>
        !file ||
        (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author name is required'),
  persona: z.string().optional(),
  voice: z.string().min(1, 'Please select a voice'),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;
