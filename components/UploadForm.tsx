'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Upload, ImageIcon, X, CheckCircle2 } from 'lucide-react';
import { cn, parsePDFFile } from '@/lib/utils';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import LoadingOverlay from './LoadingOverlay';
import {
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  voiceOptions,
  voiceCategories,
  DEFAULT_VOICE,
} from '@/lib/contants';
import { bookFormSchema, type BookFormValues } from '@/lib/zod';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  checkBookExist,
  createBook,
  saveBookSegments,
} from '@/lib/actions/book.actions';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      author: '',
      persona: '',
      pdfFile: undefined,
      coverImage: undefined,
      voice: DEFAULT_VOICE,
    },
  });

  const onSubmit = async (values: BookFormValues) => {
    if (!userId) return toast.error('Please login to continue');

    // Post
    try {
      const existCheck = await checkBookExist(values.title);

      if (existCheck.exists && existCheck.book) {
        toast.error('Book already exists');
        form.reset();
        router.push(`/books/${existCheck.book.slug}`);
        return;
      }

      const fileTitle = values.title.replace(/\s/g, '-').toLowerCase();
      const pdfFile = values.pdfFile;
      const parsedPDF = await parsePDFFile(pdfFile);

      if (parsedPDF.content.length === 0) {
        toast.error('Failed to parse PDF file. Please try again later.');
        return;
      }

      const uploadPdfBlod = await upload(`${fileTitle}.pdf`, pdfFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: 'application/pdf',
      });

      let coverUrl: string;
      if (values.coverImage && values.coverImage.length > 0) {
        const coverImage = values.coverImage[0];
        const uploadCoverImageBlod = await upload(
          `${fileTitle}_cover.png`,
          coverImage,
          {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: coverImage.type,
          }
        );
        coverUrl = uploadCoverImageBlod.url;
      } else {
        const response = await fetch(parsedPDF.cover);
        const blob = await response.blob();
        const uploadCoverImageBlod = await upload(
          `${fileTitle}_cover.png`,
          blob,
          {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: 'image/png',
          }
        );
        coverUrl = uploadCoverImageBlod.url;
      }

      const book = await createBook({
        clerkId: userId,
        title: values.title,
        author: values.author,
        persona: values.persona,
        voice: values.voice,
        fileURL: uploadPdfBlod.url,
        fileBlobKey: uploadPdfBlod.pathname,
        coverURL: coverUrl,
        fileSize: pdfFile.size,
      });

      if (!book.success) throw new Error('Failed to upload book');

      if (book.alreadyExists) {
        toast.info('Book aldredy exists');
        form.reset();
        router.push(`/books/${existCheck.book.slug}`);
        return;
      }

      const segments = await saveBookSegments(
        book.data._id,
        parsedPDF.content,
        userId
      );

      if (!segments?.success) {
        toast.error('Failed to save book segment');
        throw new Error('Failed to save book segments');
      }

      toast.success('Book uploaded successfully');
      form.reset();
      router.push(`/`);
    } catch (error) {
      console.log(error);
      toast.error('Failed to upload book. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-book-wrapper">
      {isSubmitting && <LoadingOverlay />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* PDF Upload */}
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Book PDF File</FormLabel>
                <FormControl>
                  <div className="relative">
                    {!field.value ? (
                      <label className="upload-dropzone border-2 border-dashed border-[#8B7355]/30">
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) field.onChange(file);
                          }}
                        />
                        <Upload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">
                          Click to upload PDF
                        </p>
                        <p className="upload-dropzone-hint">
                          PDF file (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
                        </p>
                      </label>
                    ) : (
                      <div className="upload-dropzone upload-dropzone-uploaded">
                        <Upload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">
                          {(field.value as File).name}
                        </p>
                        <button
                          type="button"
                          className="upload-dropzone-remove absolute top-4 right-4"
                          onClick={() => field.onChange(undefined)}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cover Image Upload */}
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">
                  Cover Image (Optional)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    {!field.value ? (
                      <label className="upload-dropzone border-2 border-dashed border-[#8B7355]/30">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) field.onChange(file);
                          }}
                        />
                        <ImageIcon className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">
                          Click to upload cover image
                        </p>
                        <p className="upload-dropzone-hint">
                          Image (max {MAX_IMAGE_SIZE / (1024 * 1024)}MB) or
                          leave empty to auto-generate
                        </p>
                      </label>
                    ) : (
                      <div className="upload-dropzone upload-dropzone-uploaded">
                        <ImageIcon className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">
                          {(field.value as File).name}
                        </p>
                        <button
                          type="button"
                          className="upload-dropzone-remove absolute top-4 right-4"
                          onClick={() => field.onChange(undefined)}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title Input */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Rich Dad Poor Dad"
                    className="form-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author Input */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Robert Kiyosaki"
                    className="form-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Persona Input */}
          <FormField
            control={form.control}
            name="persona"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Persona (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: A friendly grandpa reading a bedtime story..."
                    className="form-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Voice Selector */}
          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="form-label">
                  Choose Assistant Voice
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-6"
                  >
                    {/* Male Voices */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-[#3d485e]">
                        Male Voices
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {voiceCategories.male.map((voiceId) => {
                          const voice =
                            voiceOptions[voiceId as keyof typeof voiceOptions];
                          return (
                            <FormItem key={voiceId} className="space-y-0">
                              <FormControl>
                                <label
                                  className={cn(
                                    'voice-selector-option',
                                    field.value === voiceId
                                      ? 'voice-selector-option-selected'
                                      : 'bg-white'
                                  )}
                                >
                                  <RadioGroupItem
                                    value={voiceId}
                                    className="sr-only"
                                  />
                                  <div className="flex w-full flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[#212a3b]">
                                        {voice.name}
                                      </span>
                                      {field.value === voiceId && (
                                        <CheckCircle2
                                          size={16}
                                          className="text-[#663820]"
                                        />
                                      )}
                                    </div>
                                    <p className="text-xs leading-relaxed text-[#3d485e]">
                                      {voice.description}
                                    </p>
                                  </div>
                                </label>
                              </FormControl>
                            </FormItem>
                          );
                        })}
                      </div>
                    </div>

                    {/* Female Voices */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-[#3d485e]">
                        Female Voices
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {voiceCategories.female.map((voiceId) => {
                          const voice =
                            voiceOptions[voiceId as keyof typeof voiceOptions];
                          return (
                            <FormItem key={voiceId} className="space-y-0">
                              <FormControl>
                                <label
                                  className={cn(
                                    'voice-selector-option',
                                    field.value === voiceId
                                      ? 'voice-selector-option-selected'
                                      : 'bg-white'
                                  )}
                                >
                                  <RadioGroupItem
                                    value={voiceId}
                                    className="sr-only"
                                  />
                                  <div className="flex w-full flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[#212a3b]">
                                        {voice.name}
                                      </span>
                                      {field.value === voiceId && (
                                        <CheckCircle2
                                          size={16}
                                          className="text-[#663820]"
                                        />
                                      )}
                                    </div>
                                    <p className="text-xs leading-relaxed text-[#3d485e]">
                                      {voice.description}
                                    </p>
                                  </div>
                                </label>
                              </FormControl>
                            </FormItem>
                          );
                        })}
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="form-btn">
            Begin Synthesis
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UploadForm;
