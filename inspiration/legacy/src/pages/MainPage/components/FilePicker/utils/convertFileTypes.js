const EXTENSION_TO_MIME = {
	doc: "application/msword",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	pdf: "application/pdf",
	txt: "text/plain",
	xls: "application/vnd.ms-excel",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	csv: "text/csv",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	bmp: "image/bmp",
	svg: "image/svg+xml",
	tgz: "application/gzip",
	gz: "application/gzip",
	tar: "application/x-tar",
	zip: "application/zip",
	rar: "application/vnd.rar",
	"7z": "application/x-7z-compressed",
};

export function getDropzoneAcceptTypes(allowedFileTypes = []) {
	const acceptMap = {};

	allowedFileTypes.forEach(({ extension }) => {
		const ext = extension.toLowerCase();
		const mime = EXTENSION_TO_MIME[ext];
		if (!mime) return;

		if (!acceptMap[mime]) {
			acceptMap[mime] = [];
		}
		acceptMap[mime].push(`.${ext}`);
	});

	return acceptMap;
}
