import React, { useEffect, useRef } from 'react';

interface ResizedImage {
  base64: string;
  width: number;
  height: number;
}

interface ImageResizerProps {
  file?: File; // Make file optional
  maxWidth: number;
  maxHeight: number;
  onResize: (resizedImage: ResizedImage) => void;
  quality?: number; // Add quality prop with default value
  fileType?: 'image/jpeg' | 'image/png' | 'image/webp'; // Add fileType prop
}

const ImageResizer: React.FC<ImageResizerProps> = ({ 
  file,
  maxWidth,
  maxHeight,
  quality = 0.8, // Set default value for quality
  fileType = 'image/jpeg', // Set default value for fileType
  onResize,
}) => {
  useEffect(() => {
    if (!file) return; // Handle the case when file is undefined

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const resizedBase64 = canvas.toDataURL(fileType,quality); // Change format if needed and quality

          const resizedImage: ResizedImage = {
            base64: resizedBase64,
            width,
            height,
          };

          onResize(resizedImage);
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }, [file, maxWidth, maxHeight, onResize,fileType,quality]);

  return null; // The component doesn't render anything
};

interface ImageInputProps {
  onImageSelected: (base64Data: string) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // You can also add validation here for allowed image types (jpeg, png, etc.)
      // For simplicity, I'm assuming that the user will only select valid image files.
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          onImageSelected(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResizedImage = (resizedImage: ResizedImage) => {
    // The resizedImage.base64 is the base64 string of the resized image
    // You can now use it as needed or display it on the page

    onImageSelected(resizedImage.base64);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={uploadInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
        name='avatar'
      />
      <button className="btn btn-icon bi bi-pencil fs-6" onClick={() => uploadInputRef.current?.click()}></button> 
      <ImageResizer
        file={uploadInputRef.current?.files?.[0]}
        maxWidth={250}
        maxHeight={250}
        onResize={handleResizedImage}
        quality={90} // Adjust image quality as needed
        fileType="image/webp" // Specify the target file type as WebP
      />
    </div>
  );
};

export default ImageInput;
