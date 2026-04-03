'use client';

import { useState, CSSProperties } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fill?: boolean;
  priority?: boolean;
}

export default function ImageWithFallback({
  fallbackText = 'Image unavailable',
  alt = 'Product image',
  fill,
  style,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const containerStyle: CSSProperties = fill ? {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  } : {};

  if (hasError) {
    return (
      <div 
        className="w-full h-full bg-gray-100 flex flex-col items-center justify-center rounded-lg"
        style={containerStyle}
      >
        <PhotoIcon className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-gray-500 text-xs text-center px-2">{fallbackText}</p>
      </div>
    );
  }

  return (
    <img
      {...(props as any)}
      alt={alt}
      onError={() => setHasError(true)}
      style={{ ...style, ...containerStyle }}
    />
  );
}
