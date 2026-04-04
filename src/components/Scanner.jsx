import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function Scanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      // { fps: 10, qrbox: 250 },
       { fps: 10, qrbox: { width: 250, height: 80 }, aspectRatio: 1.8},
   
      false
    );

    scanner.render(
      (decodedText) => {
        const dni = decodedText.replace(/\D/g, "");
        onScan(dni);
      },
      () => {}
    );

    return () => scanner.clear();
  }, []);

  return <div id="reader"></div>;
}