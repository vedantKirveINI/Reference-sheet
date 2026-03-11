import { useState, useRef, useCallback } from "react";
import { ODSTextField } from "@src/module/ods";
import { ODSButton } from "@src/module/ods";
import { ODSIcon } from "@src/module/ods";
import { mainContainerStyles, uploadContainerStyles, orTextStyles, errorStyles,  } from "./styles";
import { uploadFile } from "../../utils/fileUploadApi";
import { useDropzone } from "react-dropzone";
const Uploader = ({ handleSaveImage }) => {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState({
    urlError: false,
    fileError: false,
    errorMessage: "",
  });

  const fileInputRef = useRef(null);

  const validateAndUploadUrl = (imageUrl) => {
    setUploading("url");
    if (!imageUrl) {
      setUploading(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setError({ urlError: false, fileError: false, errorMessage: "" });
      handleSaveImage({
        imageUrl: imageUrl,
        imageName: imageUrl.split("?")[0].split("/").at(-1),
      });
      setUrl("");
      setUploading(null);
    };
    img.onerror = () => {
      setError({
        urlError: true,
        fileError: false,
        errorMessage: "Invalid URL",
      });
      setUploading(null);
    };
    img.src = imageUrl;
  };

  const onChange = async (event) => {
    setUploading("file");
    setError({ urlError: false, fileError: false, errorMessage: "" });
    const file = event.target.files[0];
    if (!file) {
      setUploading(null);
      return;
    }
    const fileSize = file?.size;
    const fileSizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
    if (fileSizeInMB > "4") {
      // alert("File size must be less than 4mb");
      setUploading(null);
      setError({
        urlError: false,
        fileError: true,
        errorMessage: "File size exceeds 4 MB",
      });
      return;
    }
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedFormats.includes(file.type)) {
      setUploading(null);
      setError({
        urlError: false,
        fileError: true,
        errorMessage:
          "Invalid file format. Only JPEG, PNG, and WEBP are allowed.",
      });
      return;
    }

    const url = await uploadFile(file);
    setError({ urlError: false, fileError: false, errorMessage: "" });
    setUploading(null);
    handleSaveImage({ imageUrl: url, imageName: file?.name });
    // setPreview(url);
  };

  const onDropImage = useCallback((acceptedFiles) => {
    onChange({ target: { files: acceptedFiles } });
  }, []);

  //added missing accept value to accpet only images
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    onDropRejected: () => {
      setError({
        urlError: false,
        fileError: true,
        errorMessage:
          "Invalid file format. Only JPEG, PNG, and WEBP are allowed.",
      });
    },
  });

  return (
    <div
      style={mainContainerStyles()}
      data-testid="image-picker-upload-container"
    >
      <div
        data-testid="image-picker-upload-url-container"
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <span data-testid="image-picker-upload-url-text">
          Upload image via image URL
        </span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <ODSTextField
            fullWidth={true}
            placeholder="Paste image URL here"
            value={url}
            helperText={error.urlError ? "Invalid URL" : ""}
            onChange={(e) => {
              setError({ urlError: false, fileError: false, errorMessage: "" });
              setUrl(e.target.value);
            }}
            inputProps={{
              "data-testid": "image-picker-upload-url-input",
            }}
            disabled={uploading === "url"}
            data-testid="image-picker-upload-url-textfield"
            error={error.urlError}
            style={{
              marginBottom: "0rem",
              height: "2.375rem",
              padding: "0.625rem",
            }}
          />

          <ODSButton
            label={
              uploading === "url" ? (
                <img
                  src={
                    "https://cdn-v1.tinycommand.com/1234567890/1753683887203/Circle%20Loader%20%283%29.gif"
                  }
                  style={{ width: "25px", height: "25px" }}
                  data-testid="image-picker-upload-button-loader"
                />
              ) : (
                "Upload"
              )
            }
            variant="black-outlined"
            disabled={uploading === "url"}
            onClick={() => {
              validateAndUploadUrl(url);
            }}
            data-testid="image-picker-upload-url-button"
            style={{ width: "6rem", height: "2.375rem" }}
          />
        </div>
      </div>

      <div
        style={uploadContainerStyles({ isDragActive })}
        id="imageDropZone"
        {...getRootProps()}
        data-testid="image-picker-dropzone"
        onClick={() => {
          fileInputRef?.current?.click();
        }}
      >
        {isDragActive ? (
          <>
            <img
              src={
                "https://cdn-v1.tinycommand.com/1234567890/1753683773672/Upload%20Image%20%283%29.gif"
              }
              style={{ width: "6.25rem", height: "6.25rem" }}
              data-testid="image-picker-drag-dropzone-gif"
            />
            <div
              style={{ height: "2rem", fontSize: "1.25rem", fontWeight: 400 }}
              data-testid="image-picker-drag-dropzone-text"
            >
              Drop that file here
            </div>
          </>
        ) : uploading !== "file" ? (
          <>
            <div
              style={{
                textAlign: "center",
                fontSize: "1rem",
                color: "#000",
              }}
              data-testid="image-picker-upload-text"
            >
              Drop an image JPEG, PNG, WEBP upto 4 MB & max dimension.
            </div>
            <div style={orTextStyles()}>OR</div>
            <input
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              onChange={onChange}
              id={"image-uploader"}
              data-testid="image-picker-upload-input"
              {...getInputProps()}
              ref={fileInputRef}
            />
            <ODSButton
              label={"UPLOAD FROM DEVICE"}
              size="large"
              variant="black"
              style={{
                fontSize: "0.875rem",
              }}
              onClick={() => {
                fileInputRef?.current?.click();
              }}
              data-testid="image-picker-input-upload-button"
            />
          </>
        ) : (
          <>
            <img
              src={
                "https://cdn-v1.tinycommand.com/1234567890/1753683887203/Circle%20Loader%20%283%29.gif"
              }
              style={{ height: "6.25rem" }}
              data-testid="image-picker-upload-loader"
            />
            <p
              style={{ fontSize: "1rem" }}
              data-testid="image-picker-upload-loader-text"
            >
              Uploading image please wait...
            </p>
          </>
        )}
        {!isDragActive && error.fileError && (
          <p style={errorStyles()} data-testid="image-picker-upload-file-error">
            <ODSIcon
              outeIconName="OUTEInfoIcon"
              outeIconProps={{
                "data-testid": "image-picker-upload-file-error-icon",
                sx: {
                  color: "#FF5252",
                  transform: "rotate(180deg)",
                },
              }}
            />
            <span data-testid="image-picker-upload-file-error-text">
              {error.errorMessage}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Uploader;
