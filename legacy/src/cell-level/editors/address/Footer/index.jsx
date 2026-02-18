import { Button } from "@/components/ui/button";
import React from "react";

function Footer({ handleAllFieldsClear = () => {}, handleSubmit = () => {} }) {
	return (
		<div className="flex w-full py-2 px-3 items-center justify-end gap-4 box-border">
			<Button
				variant="outline"
				onClick={handleAllFieldsClear}
			>
				CLEAR ALL
			</Button>
			<Button variant="default" onClick={handleSubmit}>
				SAVE
			</Button>
		</div>
	);
}

export default Footer;
