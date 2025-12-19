'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface LazyIframeProps {
  src: string;
  title: string;
  scriptSrc: string;
  scriptStrategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  [key: string]: any;
}

export default function LazyIframe({
  src,
  title,
  scriptSrc,
  scriptStrategy = 'lazyOnload',
  ...iframeProps
}: LazyIframeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [loadScript, setLoadScript] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Load script after iframe is visible
            setTimeout(() => setLoadScript(true), 100);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading when iframe is 50px away
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {isVisible && (
        <>
          <iframe
            src={src}
            title={title}
            loading="lazy"
            {...iframeProps}
          />
          {loadScript && (
            <Script
              src={scriptSrc}
              strategy={scriptStrategy}
            />
          )}
        </>
      )}
      {!isVisible && (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 animate-pulse">
          <p className="text-gray-400 text-sm">Loading form...</p>
        </div>
      )}
    </div>
  );
}
