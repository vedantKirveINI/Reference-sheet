import React, { useEffect, useState } from "react";
import { gifImageStyles } from "./styles";
const RenderLoadersJsonImages = ({ selectedImage, onSelect }: any) => {
  const [images, setImages] = useState([]);

  const getImages = async (query?: string) => {
    const response = await fetch(
      "https://ccc.oute.app/forms/loader-question-type/loaders.json"
    );
    const data = await response.json();
    setImages(data?.loaders);
  };

  useEffect(() => {
    getImages();
  }, []);

  return (
    <div
      style={gifImageStyles.container}
      data-testid="image-picker-gif-images-container"
    >
      {images?.map((image, index) => {
        return (
          <div
            style={gifImageStyles.imageWrapper}
            key={index}
            onClick={() => {
              onSelect(image?.url);
            }}
            data-testid={`image-picker-gif-image-${index + 1}`}
          >
            <img
              src={image?.url}
              alt="loading"
              style={gifImageStyles.image(image.url === selectedImage)}
            />
            <p
              style={gifImageStyles.imageName}
              data-testid={`image-picker-gif-name-${index + 1}`}
            >
              {image?.name}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default RenderLoadersJsonImages;
