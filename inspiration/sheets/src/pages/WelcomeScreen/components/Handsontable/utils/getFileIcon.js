import {
	AUDIO_ICON,
	DOC_ICON,
	IMAGE_ICON,
	PDF_ICON,
	VIDEO_ICON,
	XLS_ICON,
	ZIP_ICON,
} from "../../../../../constants/Icons/fileExtensionIcons";

const FILE_EXTENSIONS = {
	png: IMAGE_ICON,
	jpg: IMAGE_ICON,
	jpeg: IMAGE_ICON,
	gif: IMAGE_ICON,
	svg: IMAGE_ICON,
	zip: ZIP_ICON,
	rar: ZIP_ICON,
	tar: ZIP_ICON,
	tgz: ZIP_ICON,
	gz: ZIP_ICON,
	pdf: PDF_ICON,
	doc: DOC_ICON,
	txt: DOC_ICON,
	docx: DOC_ICON,
	xls: XLS_ICON,
	xlsx: XLS_ICON,
	csv: XLS_ICON,
	mp3: AUDIO_ICON,
	wav: AUDIO_ICON,
	ogg: AUDIO_ICON,
	mp4: VIDEO_ICON,
	mov: VIDEO_ICON,
	avi: VIDEO_ICON,
	mkv: VIDEO_ICON,
	default: DOC_ICON,
};

function getFileExtension(url) {
	const match = url?.match(/\.([^.]+)$/);
	return match ? match[1].toLowerCase() : "doc";
}

const getFileIcon = (fileURI) => {
	const extension = getFileExtension(fileURI);
	return FILE_EXTENSIONS[extension] || FILE_EXTENSIONS.default;
};

export { FILE_EXTENSIONS, getFileExtension, getFileIcon };
