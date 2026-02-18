import { useState, useRef, useEffect } from "react";

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
                <div className="relative" ref={zoomRef}>
                        <button
                                className="flex items-center justify-between px-3 py-1.5 border border-[#e0e0e0] rounded-md bg-white cursor-pointer text-[13px] font-medium text-[#263238] w-[75px] transition-all duration-200 gap-2 hover:bg-[#f5f5f5] hover:border-[#b0b0b0] active:scale-[0.98]"
                                onClick={() => setIsOpen(!isOpen)}
                                data-testid="zoom-button"
                        >
                                {currentZoom?.label || "100%"}
                                <span className="text-[10px] text-[#666]">
                                        {isOpen ? "▲" : "▼"}
                                </span>
                        </button>

                        {isOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 bg-white border border-[#e0e0e0] rounded-md shadow-lg w-[75px] z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
                                        {ZOOM_OPTIONS.map((option) => (
                                                <button
                                                        key={option.value}
                                                        className={`block w-full py-2 px-6 border-none bg-none text-left text-[13px] font-normal text-[#263238] cursor-pointer transition-colors duration-150 hover:bg-[#f5f5f5] ${
                                                                option.value === zoomLevel ? "bg-[#e3f2fd] text-[#1a73e8] font-medium" : ""
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
