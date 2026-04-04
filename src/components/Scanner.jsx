import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

export default function Scanner({ onScan }) {
  const bloqueado = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        if (bloqueado.current) return;

        bloqueado.current = true;

        // ✅ SOPORTE DNI + CE (no quitar letras)
        const codigo = decodedText.trim().toUpperCase();

        onScan(codigo);

        // ⛔ BLOQUEAR 2 segundos
        setTimeout(() => {
          bloqueado.current = false;
        }, 2000);
      },
      () => {}
    );

    return () => scanner.clear().catch(() => {});
  }, []);

  return <div id="reader"></div>;
}