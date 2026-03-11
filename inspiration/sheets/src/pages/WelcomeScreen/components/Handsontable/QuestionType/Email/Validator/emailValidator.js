import { isEmpty } from "lodash";

import { EMAIL_REGEX } from "../../../../../../../constants/regex";

function emailValidator(emailStr = "", callback = () => {}) {
	if (EMAIL_REGEX.test(emailStr) || isEmpty(emailStr)) {
		return callback(true);
	}

	return callback(false);
}

export { emailValidator };
