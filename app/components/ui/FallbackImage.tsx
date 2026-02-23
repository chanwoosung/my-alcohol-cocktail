'use client';

import { CSSProperties, useEffect, useMemo, useState } from 'react';

type FallbackImageProps = {
  src?: string | null;
  alt: string;
  style?: CSSProperties;
  className?: string;
  fallbackSrc?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
};

const DEFAULT_FALLBACK_SRC = '/icon.webp';

const toValidSrc = (value?: string | null): string => {
  if (!value) return DEFAULT_FALLBACK_SRC;
  const trimmed = value.trim();
  return trimmed ? trimmed : DEFAULT_FALLBACK_SRC;
};

const removePreviewSuffix = (value: string): string => {
  if (!value.endsWith('/preview')) return value;
  return value.slice(0, -'/preview'.length);
};

export default function FallbackImage({
  src,
  alt,
  style,
  className,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  loading = 'lazy',
  decoding = 'async',
}: FallbackImageProps) {
  const initialSrc = useMemo(() => toValidSrc(src), [src]);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [triedWithoutPreview, setTriedWithoutPreview] = useState(false);

  useEffect(() => {
    setCurrentSrc(initialSrc);
    setTriedWithoutPreview(false);
  }, [initialSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      style={style}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => {
        const noPreview = removePreviewSuffix(currentSrc);
        if (!triedWithoutPreview && noPreview !== currentSrc) {
          setTriedWithoutPreview(true);
          setCurrentSrc(noPreview);
          return;
        }
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
