import { Label } from "@/components/ui/label";
import React, { forwardRef, useRef, useEffect, useCallback, useImperativeHandle } from "react";

import styles from "./styles.module.scss";

const CANVAS_WIDTH = 490;
const CANVAS_HEIGHT = 240;

const Content = (
        { handleSignatureChange = () => {}, signatureImage = "" },
        ref,
) => {
        const canvasRef = useRef(null);
        const isDrawing = useRef(false);

        useImperativeHandle(ref, () => ({
                clear: () => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const ctx = canvas.getContext("2d");
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        handleSignatureChange("");
                },
                toDataURL: () => {
                        const canvas = canvasRef.current;
                        if (!canvas) return "";
                        return canvas.toDataURL("image/png");
                },
                isEmpty: () => {
                        const canvas = canvasRef.current;
                        if (!canvas) return true;
                        const ctx = canvas.getContext("2d");
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        return !imageData.data.some((channel, i) => i % 4 === 3 && channel !== 0);
                },
        }));

        useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas || !signatureImage) return;
                const ctx = canvas.getContext("2d");
                const img = new Image();
                img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = signatureImage;
        }, [signatureImage]);

        const getPos = useCallback((e) => {
                const canvas = canvasRef.current;
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                if (e.touches) {
                        return {
                                x: (e.touches[0].clientX - rect.left) * scaleX,
                                y: (e.touches[0].clientY - rect.top) * scaleY,
                        };
                }
                return {
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top) * scaleY,
                };
        }, []);

        const startDrawing = useCallback((e) => {
                e.preventDefault();
                isDrawing.current = true;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                const pos = getPos(e);
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
        }, [getPos]);

        const draw = useCallback((e) => {
                if (!isDrawing.current) return;
                e.preventDefault();
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                const pos = getPos(e);
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#000";
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
        }, [getPos]);

        const stopDrawing = useCallback(() => {
                if (!isDrawing.current) return;
                isDrawing.current = false;
                const canvas = canvasRef.current;
                if (canvas) {
                        handleSignatureChange(canvas.toDataURL("image/png"));
                }
        }, [handleSignatureChange]);

        useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                canvas.addEventListener("mousedown", startDrawing);
                canvas.addEventListener("mousemove", draw);
                canvas.addEventListener("mouseup", stopDrawing);
                canvas.addEventListener("mouseleave", stopDrawing);
                canvas.addEventListener("touchstart", startDrawing, { passive: false });
                canvas.addEventListener("touchmove", draw, { passive: false });
                canvas.addEventListener("touchend", stopDrawing);
                return () => {
                        canvas.removeEventListener("mousedown", startDrawing);
                        canvas.removeEventListener("mousemove", draw);
                        canvas.removeEventListener("mouseup", stopDrawing);
                        canvas.removeEventListener("mouseleave", stopDrawing);
                        canvas.removeEventListener("touchstart", startDrawing);
                        canvas.removeEventListener("touchmove", draw);
                        canvas.removeEventListener("touchend", stopDrawing);
                };
        }, [startDrawing, draw, stopDrawing]);

        return (
                <div className={styles.content_container}>
                        <Label
                                className="text-sm font-normal"
                                style={{ fontFamily: "Inter", color: "#607D8B" }}
                        >
                                Please sign in the designated area below, ensuring your
                                signature stays within the boundaries.
                        </Label>
                        <div className={styles.signature_canvas}>
                                <canvas
                                        ref={canvasRef}
                                        width={CANVAS_WIDTH}
                                        height={CANVAS_HEIGHT}
                                        style={{
                                                width: "30.625rem",
                                                height: "15rem",
                                                border: "0.047rem solid rgba(0, 0, 0, 0.20)",
                                                borderRadius: "0.75rem",
                                                cursor: "crosshair",
                                                touchAction: "none",
                                        }}
                                        data-testid="signature-canvas"
                                />
                        </div>
                </div>
        );
};

export default forwardRef(Content);
