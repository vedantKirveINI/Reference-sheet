import { imageStyles } from "./styles";
export const RenderImageArray = ({ images, onImageSelect, testIdPrefix }) => {
  return images?.map((image: any, index) => {
    return (
      <figure
        key={image?.id}
        style={imageStyles.container}
        onClick={() => {
          onImageSelect(image);
        }}
        data-testid={`image-picker-${testIdPrefix}-figure-${index + 1}`}
      >
        <img
          loading="lazy"
          key={index}
          src={image?.urls?.regular || image?.url}
          style={imageStyles.image}
          alt=""
          data-testid={`image-picker-${testIdPrefix}-image-${index + 1}`}
        />
        <div style={imageStyles.effect} />
        {image?.user?.username && (
          <a
            // href={image?.user?.links?.html}
            href={`https://unsplash.com/@${image?.user?.username}?utm_source=oute&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={imageStyles.username}
            data-testid={`image-picker-${testIdPrefix}-name-${index + 1}`}
          >
            @{image?.user?.username}
          </a>
        )}
      </figure>
    );
  });
};
