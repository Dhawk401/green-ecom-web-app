// src/components/LazyImage.jsx
import React, { useRef, useState, useEffect } from 'react';

export default function LazyImage({
  src,
  alt = '',
  placeholder = null,
  srcSet = undefined,
  sizes = undefined,
  className = '',
  width = undefined,
  height = undefined,
  style = {},
  fallbackSrc = undefined,
  ...rest
}) {
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'loading' in HTMLImageElement.prototype) {
      setVisible(true);
      return;
    }

    const el = wrapperRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '300px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // reset loaded state when source changes
    setLoaded(false);
  }, [currentSrc]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    if (currentSrc !== '/assets/fallback.webp') {
      setCurrentSrc('/assets/fallback.webp');
    }
  };

  // Styles: both placeholder and real image cover the wrapper fully.
  const wrapperStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: width ? width : '100%',
    height: height ? height : '100%', // let CSS or parent decide actual height
    display: 'block',
    ...style,
  };

  const commonImgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',     // critical: ensure image fills wrapper height
    objectFit: 'cover', // critical: crop to fill
    display: 'block',
  };

  const placeholderStyle = {
    ...commonImgStyle,
    filter: 'blur(8px)',
    transform: 'scale(1.02)',
    transition: 'opacity .28s ease',
    opacity: loaded ? 0 : 1,
  };

  const realImgStyle = {
    ...commonImgStyle,
    transition: 'opacity .28s ease, transform .28s ease',
    opacity: loaded ? 1 : 0,
  };

  return (
    <div ref={wrapperRef} className={className} style={wrapperStyle}>
      {placeholder && (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          style={placeholderStyle}
          draggable={false}
        />
      )}

      {visible && (
        <img
          src={currentSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={realImgStyle}
          width={width}
          height={height}
          {...rest}
        />
      )}
    </div>
  );
}
