'use client';

import { useState, CSSProperties, ImgHTMLAttributes } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ImgWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export default function ImgWithFallback({
  fallbackText = 'Image unavailable',
  ...props
}: ImgWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center rounded-lg">
        <PhotoIcon className="w-8 h-8 text-gray-300 mb-1" />
        <p className="text-gray-500 text-xs text-center px-2">{fallbackText}</p>
      </div>
    );
  }

  return (
    <img
      {...props}
      onError={() => setHasError(true)}
    />
  );
}
