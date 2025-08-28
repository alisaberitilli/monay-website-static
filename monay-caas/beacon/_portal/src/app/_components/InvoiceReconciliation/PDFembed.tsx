import React, { useRef, useEffect } from 'react';

interface PdfEmbedProps {
  pdfSource: string;
}

const PdfEmbed: React.FC<PdfEmbedProps> = ({ 
    pdfSource = 'file_url_from_S3_bucket'
}) => {
  const embedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embedContainer = embedContainerRef.current;

    const handleResize = () => {
      const newWidth = embedContainer?.offsetWidth || 0;
      if (embedContainer) {
        embedContainer.innerHTML = `<embed src="${pdfSource}" width="${newWidth}px" height="100%" type="application/pdf" />`;
      }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pdfSource]);

  return <div ref={embedContainerRef} style={{ width: '100%', height: '100%', overflow: 'auto' }} />;
};

export default PdfEmbed;
