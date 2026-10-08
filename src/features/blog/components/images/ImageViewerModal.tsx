'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ArticleImageDescriptor } from './ArticleImageViewerContext';
import useImageViewerIsolation from './useImageViewerIsolation';

type ImageViewerModalProps = Readonly<{
  image: ArticleImageDescriptor;
  trigger: HTMLButtonElement;
  onExited: () => void;
}>;

const EXIT_DURATION = 240;

export default function ImageViewerModal({ image, trigger, onExited }: ImageViewerModalProps) {
  const [phase, setPhase] = useState<'entering' | 'open' | 'closing'>('entering');
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const captionId = useId();
  const caption = image.caption?.trim() ? image.caption : undefined;

  const closeViewer = useCallback(() => {
    setPhase('closing');
  }, []);

  useImageViewerIsolation({ dialogRef, closeRef, trigger, onClose: closeViewer });

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setPhase(current => current === 'entering' ? 'open' : current));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'closing') {
      return;
    }

    const timeout = window.setTimeout(onExited, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : EXIT_DURATION);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [phase, onExited]);

  const onImageClick = (event: MouseEvent<HTMLImageElement>) => {
    const element = event.currentTarget;

    if (!element.naturalWidth || !element.naturalHeight) {
      return;
    }

    // object-contain leaves transparent space inside the image element; that space is backdrop.
    const bounds = element.getBoundingClientRect();
    const scale = Math.min(bounds.width / element.naturalWidth, bounds.height / element.naturalHeight);
    const width = element.naturalWidth * scale;
    const height = element.naturalHeight * scale;
    const left = bounds.left + (bounds.width - width) / 2;
    const top = bounds.top + (bounds.height - height) / 2;

    if (event.clientX < left || event.clientX > left + width || event.clientY < top || event.clientY > top + height) {
      closeViewer();
    }
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      aria-describedby={caption ? captionId : undefined}
      className={`fixed inset-0 z-[130] grid h-screen grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4 bg-white/18 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none supports-[height:100dvh]:h-dvh dark:bg-black/45 sm:px-8 sm:pb-8 ${phase === 'open' ? 'opacity-100' : 'opacity-0'}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeViewer();
        }
      }}
      onKeyDown={(event) => event.stopPropagation()}
      onTransitionEnd={(event) => {
        if (phase === 'closing' && event.target === event.currentTarget && event.propertyName === 'opacity') {
          onExited();
        }
      }}
    >
      <div className="pointer-events-none flex justify-end">
        <button
          ref={closeRef}
          type="button"
          aria-label="Close image"
          onClick={closeViewer}
          className="pointer-events-auto min-h-11 rounded-lg border border-border-light/80 bg-background-main-light/90 px-4 text-sm font-semibold text-main-light shadow-sm hover:bg-background-secondary-light dark:border-border-dark/80 dark:bg-background-main-dark/90 dark:text-main-dark dark:hover:bg-background-secondary-dark"
        >
          Close
        </button>
      </div>

      <figure className={`pointer-events-none m-0 flex min-h-0 min-w-0 flex-col items-center gap-3 transition-transform duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${phase === 'open' ? 'scale-100' : 'scale-[0.98]'}`}>
        <div className="relative min-h-0 w-full flex-1">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
            className="pointer-events-auto m-0 object-contain"
            onLoad={() => setLoadState('loaded')}
            onError={() => setLoadState('failed')}
            onClick={onImageClick}
          />
          {loadState !== 'loaded'
            ? (
              <p role="status" className="absolute inset-0 m-0 flex items-center justify-center text-center">
                <span className="rounded-lg bg-background-main-light/90 px-4 py-3 text-sm text-main-light dark:bg-background-main-dark/90 dark:text-main-dark">
                  {loadState === 'failed' ? 'Unable to load image.' : 'Loading image…'}
                </span>
              </p>
            )
            : null}
        </div>
        {caption
          ? (
            <figcaption
              id={captionId}
              tabIndex={0}
              className="pointer-events-auto max-h-[25vh] max-w-[min(100%,70ch)] shrink-0 overflow-y-auto rounded-lg bg-background-main-light/90 px-4 py-2 text-center text-sm wrap-break-word text-main-light focus-visible:outline-2 focus-visible:outline-primary-500 dark:bg-background-main-dark/90 dark:text-main-dark"
            >
              {caption}
            </figcaption>
          )
          : null}
      </figure>
    </div>,
    document.body,
  );
}
