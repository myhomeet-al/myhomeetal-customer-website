'use client';

import { useState } from 'react';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';
import './image-gallery.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { PhotoIcon } from '@heroicons/react/24/outline';

import Button from '../Button';

const ProductGallery = ({ images }: { images: string[] }) => {
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const handleImageError = (image: string) => {
    setBrokenImages(prev => new Set([...prev, image]));
  };

  const galleryImages: ReactImageGalleryItem[] = images?.map((image) => ({
    original: image,
    thumbnail: image,
    renderItem: brokenImages.has(image) ? () => (
      <div className="image-gallery-image w-full h-[500px] bg-gray-100 flex flex-col items-center justify-center">
        <PhotoIcon className="w-16 h-16 text-gray-300 mb-2" />
        <p className="text-gray-500 text-center">Image unavailable</p>
      </div>
    ) : undefined,
    renderThumbInner: brokenImages.has(image) ? () => (
      <div className="w-full bg-gray-100 flex flex-col items-center justify-center border border-gray-200 rounded-2xl" style={{ aspectRatio: '1/1' }}>
        <PhotoIcon className="w-12 h-12 text-gray-300 mb-2" />
        <p className="text-gray-400 text-xs text-center px-1">Unavailable</p>
      </div>
    ) : undefined,
  }));

  const renderLeftNav = (onClick: any, disabled: boolean) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      className='image-gallery-icon image-gallery-left-nav'
    >
      <FaChevronLeft />
    </Button>
  );

  const renderRightNav = (onClick: any, disabled: boolean) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      className='image-gallery-icon image-gallery-right-nav'
    >
      <FaChevronRight />
    </Button>
  );

  return (
    <div className='hidden pr-1 lg:block h-[500px]'>
      <ImageGallery
        items={galleryImages}
        thumbnailPosition='left'
        showPlayButton={false}
        showFullscreenButton={false}
        renderLeftNav={renderLeftNav}
        renderRightNav={renderRightNav}
        disableKeyDown
        onImageError={(e) => {
          const img = e.target as HTMLImageElement;
          if (img && img.src) {
            handleImageError(img.src);
          }
        }}
        onThumbnailError={(e) => {
          const img = e.target as HTMLImageElement;
          if (img && img.src) {
            handleImageError(img.src);
          }
        }}
      />
    </div>
  );
};

export default ProductGallery;
