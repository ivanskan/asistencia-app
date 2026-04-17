import { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { db } from "/src/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  getDocs, 
  deleteDoc 
} from "firebase/firestore";

export default function Adm() {

  const [baseExcel, setBaseExcel] = useState([]); // programados (local)
  const [programados, setProgramados] = useState([]); // firebase
  const [mensaje, setMensaje] = useState(null);
 
  // ESCUCHAR PROGRAMADOS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "programados"), (snapshot) => {
      const datos = snapshot.docs.map(doc => doc.data());
      setProgramados(datos);
    });

    return () => unsub();
  }, []);


  // IMPORTAR EXCEL (LOCAL)
  const importarExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (ev) => {
      const workbook = XLSX.read(ev.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const data = filas.map((row) => ({
        dni: String(row["DNI"] || "").trim().toUpperCase(),
        nombre: row["NOMBRE"] || "",
        curso: row["CURSO"] || "",
        empresa: row["EMPRESA"] || "",
        aula: row["AULA"] || ""
      }));

      setBaseExcel(data);
    };

    reader.readAsBinaryString(file);
  };

  // SUBIR EXCEL A FIREBASE

  const subirProgramados = async () => {
    if (baseExcel.length === 0) {
      setMensaje({ tipo: "error", texto: "❌ No hay datos cargados" });
      return;
    }

    try {
      // eliminar anteriores
      const snapshot = await getDocs(collection(db, "programados"));
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));

      // subir TODOS en paralelo (CLAVE)
      await Promise.all(
        baseExcel.map(p =>
          addDoc(collection(db, "programados"), p)
        )
      );

      setMensaje({
        tipo: "ok",
        texto: `☁️ ${baseExcel.length} programados subidos`
      });

      setBaseExcel([]);

    } catch (err) {
      console.error("🔥 ERROR SUBIDA:", err);
      setMensaje({ tipo: "error", texto: "❌ Error subiendo datos" });
    }

    setTimeout(() => setMensaje(null), 2000);
  };

  return (
    <div className="container py-3">

      <h4 className="mb-4 text-center fw-bold text-primary">ADM</h4>

      <div className="d-flex mb-3">
        <input type="file" onChange={importarExcel} className="form-control"/>
        <button className="btn btn-warning ms-2" onClick={subirProgramados}>
          <span className="fw-semibold">☁️&nbsp;Subir</span>
        </button>
      </div>
      {mensaje && (
        <div className={`alert d-flex justify-content-center ${
          mensaje.tipo === "ok" ? "alert-success" :
          mensaje.tipo === "warning" ? "alert-warning" :
          "alert-danger"
        }`}>
          <pre style={{margin:0}}>{mensaje.texto}</pre>
        </div>
      )}

    </div>
  );
}

