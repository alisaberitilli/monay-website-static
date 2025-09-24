import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

// Optimized Image Component with Next.js Image
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  className = '',
  style,
  onLoad,
  onError,
  sizes,
  loading = 'lazy'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Fallback to placeholder image
    setImgSrc('/images/placeholder.png');
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`image-error ${className}`} style={style}>
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`image-container ${className} ${isLoading ? 'loading' : ''}`}>
      <Image
        src={imgSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`optimized-image ${className}`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes || (fill ? '100vw' : undefined)}
        loading={loading}
      />
      {isLoading && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
    </div>
  );
};

// Logo Component with optimized loading
export const Logo = ({ variant = 'default', className = '' }: any) => {
  const logoSrc = variant === 'dark' ? '/images/logo-dark.png' : '/images/logo.png';

  return (
    <OptimizedImage
      src={logoSrc}
      alt="Monay Logo"
      width={150}
      height={40}
      priority={true}
      className={`logo ${className}`}
    />
  );
};

// Avatar Component with optimized loading
export const Avatar = ({
  src,
  alt,
  size = 40,
  className = '',
  fallback = '/images/default-avatar.png'
}: any) => {
  const [avatarSrc, setAvatarSrc] = useState(src || fallback);

  return (
    <div className={`avatar ${className}`} style={{ width: size, height: size }}>
      <OptimizedImage
        src={avatarSrc}
        alt={alt || 'User Avatar'}
        width={size}
        height={size}
        className="avatar-image"
        onError={() => setAvatarSrc(fallback)}
        quality={90}
      />
    </div>
  );
};

// Card Image Component with lazy loading
export const CardImage = ({
  src,
  alt,
  aspectRatio = '16/9',
  className = ''
}: any) => {
  return (
    <div className={`card-image-wrapper ${className}`} style={{ aspectRatio }}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="card-image"
        quality={80}
      />
    </div>
  );
};

// Hero Image Component with priority loading
export const HeroImage = ({
  src,
  alt,
  height = 500,
  className = ''
}: any) => {
  return (
    <div className={`hero-image-wrapper ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="hero-image"
      />
    </div>
  );
};

// Thumbnail Component with blur placeholder
export const Thumbnail = ({
  src,
  alt,
  size = 100,
  blurDataURL,
  onClick
}: any) => {
  return (
    <button
      className="thumbnail-button"
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        quality={70}
        className="thumbnail-image"
      />
    </button>
  );
};

// Background Image Component
export const BackgroundImage = ({
  src,
  alt,
  children,
  className = '',
  overlay = false
}: any) => {
  return (
    <div className={`background-image-container ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        quality={85}
        sizes="100vw"
        className="background-image"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
      {overlay && <div className="background-overlay" />}
      <div className="background-content">
        {children}
      </div>
    </div>
  );
};

// Gallery Image Component with progressive loading
export const GalleryImage = ({
  src,
  alt,
  thumbnailSrc,
  onClick,
  index
}: any) => {
  const [isFullSize, setIsFullSize] = useState(false);

  return (
    <>
      <button
        className="gallery-item"
        onClick={() => {
          setIsFullSize(true);
          onClick?.(index);
        }}
      >
        <OptimizedImage
          src={thumbnailSrc || src}
          alt={alt}
          width={300}
          height={200}
          quality={70}
          className="gallery-thumbnail"
        />
      </button>

      {isFullSize && (
        <div className="gallery-fullsize" onClick={() => setIsFullSize(false)}>
          <OptimizedImage
            src={src}
            alt={alt}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="gallery-fullsize-image"
          />
        </div>
      )}
    </>
  );
};

// Icon Image Component for optimized icons
export const IconImage = ({
  src,
  alt,
  size = 24,
  className = ''
}: any) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority
      quality={100}
      className={`icon-image ${className}`}
    />
  );
};

// Responsive Image Component
export const ResponsiveImage = ({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  alt,
  className = ''
}: any) => {
  const [currentSrc, setCurrentSrc] = useState(desktopSrc);

  useEffect(() => {
    const updateSrc = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentSrc(mobileSrc || desktopSrc);
      } else if (width < 1024) {
        setCurrentSrc(tabletSrc || desktopSrc);
      } else {
        setCurrentSrc(desktopSrc);
      }
    };

    updateSrc();
    window.addEventListener('resize', updateSrc);
    return () => window.removeEventListener('resize', updateSrc);
  }, [mobileSrc, tabletSrc, desktopSrc]);

  return (
    <OptimizedImage
      src={currentSrc}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
      className={`responsive-image ${className}`}
    />
  );
};

// Export all components
export default OptimizedImage;