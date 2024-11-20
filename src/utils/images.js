import React from 'react';

export const ImageResizer = ({ file, maxWidth, maxHeight, onResize }) => {
  const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (event) {
      img.onload = function () {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }

          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
        callback(resizedImage);
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (file) {
      resizeImage(file, maxWidth, maxHeight, onResize);
    }
  }, [file, maxWidth, maxHeight, onResize]);

  return null;
};

