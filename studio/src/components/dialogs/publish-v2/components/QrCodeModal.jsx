import { useRef, useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublish } from "../context";

const QrCodeModal = ({ onClose }) => {
  const { formUrl, assetDetails } = usePublish();
  const canvasRef = useRef(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (formUrl && canvasRef.current) {
      import("qrcode").then((QRCode) => {
        QRCode.toCanvas(
          canvasRef.current,
          formUrl,
          {
            width: 256,
            margin: 2,
            color: {
              dark: "#1C3693",
              light: "#ffffff",
            },
          },
          (error) => {
            if (!error) {
              setQrGenerated(true);
            }
          }
        );
      }).catch(() => {
      });
    }
  }, [formUrl]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `${assetDetails?.asset?.name || "form"}-qr-code.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900">QR Code</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
            <canvas ref={canvasRef} />
          </div>

          <p className="text-sm text-zinc-500 text-center">
            Scan this QR code to open the form on any device
          </p>

          {qrGenerated && (
            <Button onClick={handleDownload} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
