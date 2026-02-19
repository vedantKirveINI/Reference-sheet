// Simplified Zoom component - Inspired by sheets Zoom
import { useState, useRef, useEffect } from "react";
import styles from "./Zoom.module.scss";

interface ZoomProps {
	zoomLevel?: number;
	setZoomLevel?: (level: number) => void;
}

const ZOOM_OPTIONS = [
	{ label: "50%", value: 50 },
	{ label: "75%", value: 75 },
	{ label: "90%", value: 90 },
	{ label: "100%", value: 100 },
	{ label: "125%", value: 125 },
	{ label: "150%", value: 150 },
	{ label: "200%", value: 200 },
];

function Zoom({ zoomLevel = 100, setZoomLevel }: ZoomProps) {
	const [isOpen, setIsOpen] = useState(false);
	const zoomRef = useRef<HTMLDivElement>(null);

	const handleZoomChange = (level: number) => {
		if (setZoomLevel) {
			setZoomLevel(level);
		}
		setIsOpen(false);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				zoomRef.current &&
				!zoomRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const currentZoom = ZOOM_OPTIONS.find(
		(option) => option.value === zoomLevel,
	);

	return (
		<div className={styles.zoomContainer} ref={zoomRef}>
			<button
				className={styles.zoomButton}
				onClick={() => setIsOpen(!isOpen)}
				data-testid="zoom-button"
			>
				{currentZoom?.label || "100%"}
				<span className={styles.dropdownArrow}>
					{isOpen ? "▲" : "▼"}
				</span>
			</button>

			{isOpen && (
				<div className={styles.dropdownMenu}>
					{ZOOM_OPTIONS.map((option) => (
						<button
							key={option.value}
							className={`${styles.dropdownItem} ${
								option.value === zoomLevel ? styles.active : ""
							}`}
							onClick={() => handleZoomChange(option.value)}
						>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default Zoom;
