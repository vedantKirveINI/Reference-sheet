import imageIcon from "./assets/file-type-icons/image.svg";
import pdfIcon from "./assets/file-type-icons/pdf.svg";
import docIcon from "./assets/file-type-icons/doc.svg";
import audioIcon from "./assets/file-type-icons/audio.svg";
import videoIcon from "./assets/file-type-icons/video.svg";
import exelIcon from "./assets/file-type-icons/exel.svg";
import zipIcon from "./assets/file-type-icons/zip.svg";

export const FILE_TYPES = {
  png: imageIcon,
  jpg: imageIcon,
  jpeg: imageIcon,
  gif: imageIcon,
  svg: imageIcon,
  bmp: imageIcon,
  zip: zipIcon,
  rar: zipIcon,
  tar: zipIcon,
  tgz: zipIcon,
  gz: zipIcon,
  "7z": zipIcon,
  pdf: pdfIcon,
  doc: docIcon,
  txt: docIcon,
  docx: docIcon,
  xls: exelIcon,
  xlsx: exelIcon,
  csv: exelIcon,
  mp3: audioIcon,
  wav: audioIcon,
  ogg: audioIcon,
  mp4: videoIcon,
  mov: videoIcon,
  avi: videoIcon,
  mkv: videoIcon,
  default: docIcon,
};

export const calculateFileSize = (file) => {
  const calculatedSize = file?.size / (1024 * 1024);
  let fileSize = "";
  if (calculatedSize < 1) {
    fileSize = `${(file?.size / 1024).toFixed(2)}KB`;
  } else {
    fileSize = `${(file?.size / (1024 * 1024)).toFixed(2)}MB`;
  }
  return fileSize;
};
