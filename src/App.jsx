import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Scanner from "./components/Scanner";

function App() {
  const [lista, setLista] = useState([]);
  const [mostrarScanner, setMostrarScanner] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [dniInput, setDniInput] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({
    dni: "",
    nombre: "",
    curso: ""
  });

  const ultimoScan = useRef("");

  const audioRef = useRef(null);
  // 🔊 sonido
  const beep = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };
  
  // IMPORTAR
  const importarExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (ev) => {
      const workbook = XLSX.read(ev.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const data = filas.map((row, i) => ({
        item: i + 1,
        dni: String(row["DNI"] || "").trim(),
        nombre: row["NOMBRE"] || "",
        curso: row["CURSO"] || "",
        empresa: row["EMPRESA"] || "",
        asistencia: "",
        fuente: "excel",
        hora: null
      }));

      setLista(data);
    };

    reader.readAsBinaryString(file);
  };

  // REGISTRAR (FIX PRO)
  const marcarAsistencia = (dniRaw) => {
    const dni = dniRaw.replace(/\D/g, "");
    setDniInput(dni); // 👈 AGREGA ESTO

    // evitar doble scan
    if (dni === ultimoScan.current) return;
    ultimoScan.current = dni;
    setTimeout(() => (ultimoScan.current = ""), 2500);

    setLista((prev) => {
      let encontrado = false;
      let ya = false;
      let persona = null;

      const nueva = prev.map((p) => {
        if (p.dni === dni) {
          encontrado = true;
          persona = p;

          if (p.asistencia) {
            ya = true;
            return p;
          }

          return {
            ...p,
            asistencia: "Presente",
            hora: new Date().toLocaleTimeString()
          };
        }
        return p;
      });

      // MENSAJES
      if (!encontrado) {
        setMensaje({ tipo: "error", texto: `❌ DNI ${dni} no encontrado` });
      } else if (ya) {
        setMensaje({
          tipo: "warning",
          texto: `⚠️ Ya registrado\n${persona.nombre}`
        });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `✅ ${persona.nombre}\n📚 ${persona.curso}\n🆔 ${dni}`
        });
        beep();
      }

      setTimeout(() => setMensaje(null), 2000);

      return nueva;
    });
  };

  // BOTÓN MÓVIL
  const handleManual = () => {
    if (!dniInput) return;
    marcarAsistencia(dniInput);
    setDniInput("");
  };

  // AGREGAR
  const guardarNuevo = () => {
    if (!nuevo.dni || !nuevo.nombre) {
      setMensaje({ tipo: "error", texto: "❌ DNI y nombre obligatorios" });
      return;
    }

    setLista((prev) => [
      ...prev,
      {
        dni: nuevo.dni,
        nombre: nuevo.nombre,
        curso: nuevo.curso,
        empresa: "",
        puesto: "",
        asistencia: "Adicional",
        fuente: "manual"
      }
    ]);

    setMensaje({
      tipo: "ok",
      texto: `✅ Agregado correctamente: ${nuevo.nombre}`
    });

    setTimeout(() => setMensaje(null), 2000);

    setNuevo({ dni: "", nombre: "", curso: "" });
    setMostrarForm(false);
  };

  // EXPORTAR
  const exportar = () => {
    const data = lista.map((p) => ({
      DNI: p.dni,
      NOMBRE: p.nombre,
      CURSO: p.curso,
      EMPRESA: p.empresa,
      ASISTENCIA: p.asistencia,
      HORA: p.hora || ""
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ASISTENCIA");

    XLSX.writeFile(wb, "asistencia.xlsx");
  };

  // RESUMEN (SIEMPRE actualizado)
  const total = lista.length;
  const presentes = lista.filter(p => p.asistencia === "Presente").length;
  const adicionales = lista.filter(p => p.asistencia === "Adicional").length;

  return (
    <div className="container py-3">

      <h4 className="text-center mb-3">Asistencia ERS</h4>

      <input type="file" onChange={importarExcel} className="form-control mb-3"/>

      {/* INPUT + BOTÓN */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Ingrese DNI"
          value={dniInput}
          onChange={(e) => setDniInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleManual();
          }}
        />
        <button className="btn btn-primary" onClick={handleManual}>
          ✔
        </button>
      </div>

      <div className="d-flex gap-2 mb-3 justify-content-between">
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setMostrarScanner(!mostrarScanner)}>
            📸 Scanner
          </button>
          <button className="btn btn-success" onClick={() => setMostrarForm(true)}>
            ➕
          </button>
        </div>

        <button className="btn btn-dark" onClick={exportar}>
          ⬇
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-3 mb-3 shadow-sm">
          <h6>Nuevo participante</h6>

          <input
            className="form-control mb-2"
            placeholder="DNI"
            value={nuevo.dni}
            onChange={(e) => setNuevo({ ...nuevo, dni: e.target.value })}
          />

          <input
            className="form-control mb-2"
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          />

          <input
            className="form-control mb-2"
            placeholder="Curso"
            value={nuevo.curso}
            onChange={(e) => setNuevo({ ...nuevo, curso: e.target.value })}
          />

          <div className="d-flex gap-2">
            <button className="btn btn-success w-100" onClick={guardarNuevo}>
              Guardar
            </button>
            <button className="btn btn-secondary w-100" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mostrarScanner && <Scanner onScan={marcarAsistencia} />}

      {/* MENSAJE VISUAL */}
      {mensaje && (
        <div className={`alert mt-2 text-center ${
          mensaje.tipo === "ok" ? "alert-success" :
          mensaje.tipo === "warning" ? "alert-warning" :
          "alert-danger"
        }`}>
          <pre style={{margin:0}}>{mensaje.texto}</pre>
        </div>
      )}

      <div className="resumen alert alert-info">
        <span><b>Total:</b> {total}</span>
        <span><b>Presentes:</b> {presentes}</span>
        <span><b>Adicionales:</b> {adicionales}</span>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>DNI</th>
              <th>NOMBRE</th>
              <th>CURSO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={i}
                className={
                  p.asistencia === "Presente"
                    ? "table-success"
                    : p.asistencia === "Adicional"
                    ? "table-warning"
                    : ""
                }>
                <td>{p.dni}</td>
                <td>{p.nombre}</td>
                <td>{p.curso}</td>
                <td>{p.asistencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;