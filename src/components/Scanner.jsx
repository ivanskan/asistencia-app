import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

function Scanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 80 }, // 🔥 RECTÁNGULO tipo código barras
        aspectRatio: 1.8
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="scanner-container">
      <div id="reader"></div>
    </div>
  );
}

export default Scanner;