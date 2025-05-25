'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from 'src/lib/hooks/useAuth';
import { db } from 'src/lib/firebase/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  userId: string;
  prompt: string;
  modelId: string;
  imageUrl: string;
  originalFalUrl?: string;
  createdAt: Timestamp;
}

const GalleryPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsFetching(true);
      return;
    }

    if (!user) {
      setIsFetching(false);
      // No need to redirect here, UI will handle showing login message
      return;
    }

    const fetchImages = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'userImages'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const images = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as GalleryImage));
        setGalleryImages(images);
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError('Failed to load your gallery. Please try again later.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchImages();
  }, [user, authLoading]);

  if (authLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-700">Loading Your Gallery...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          Please log in to view your image gallery.
        </p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Dotted Background Pattern - subtle */}
      <div className="fixed inset-0 bg-[radial-gradient(#d4d4d8_0.5px,transparent_0.5px)] [background-size:16px_16px] pointer-events-none opacity-30 -z-10" />
      
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Your Gallery</h1>
        <p className="text-gray-600 mt-2">A collection of your generated images.</p>
         <Link href="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to Image Generator
        </Link>
      </header>

      {galleryImages.length === 0 ? (
        <div className="text-center text-gray-500">
          <p className="text-xl">Your gallery is empty.</p>
          <p>Start generating some images to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryImages.map(image => (
            <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden group transition-all hover:shadow-xl">
              <div className="aspect-square w-full overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt={image.prompt || 'Gallery image'}
                  width={500} // Provide appropriate width
                  height={500} // Provide appropriate height
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  priority={galleryImages.indexOf(image) < 4} // Prioritize loading for first few images
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 truncate" title={image.prompt}>
                  <strong>Prompt:</strong> {image.prompt || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Model:</strong> {image.modelId || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Created:</strong> {new Date(image.createdAt.seconds * 1000).toLocaleDateString()}
                </p>
                <a 
                  href={image.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-blue-500 hover:text-blue-600"
                >
                  View Full Image
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
