import { useState } from "react";
import * as XLSX from "xlsx";
import Scanner from "./components/Scanner";

function App() {
  const [lista, setLista] = useState([]);
  const [mostrarScanner, setMostrarScanner] = useState(false);

  // IMPORTAR EXCEL
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
        nombre: row["APELLIDOS Y NOMBRES"] || "",
        curso: row["CURSO"] || "",
        empresa: row["EMPRESA"] || "",
        puesto: row["PUESTO DE TRABAJO"] || "",
        asistencia: "",
        fuente: "excel",
        hora: null
      }));

      setLista(data);
    };

    reader.readAsBinaryString(file);
  };

  // REGISTRAR
  const marcarAsistencia = (dniInput) => {
    const dni = dniInput.replace(/\D/g, "");

    let encontrado = false;
    let ya = false;

    const nueva = lista.map((p) => {
      if (p.dni === dni) {
        encontrado = true;

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

    if (!encontrado) return alert("❌ DNI no encontrado");
    if (ya) return alert("⚠️ Ya registrado");

    setLista(nueva);
  };

  // AGREGAR MANUAL
  const agregar = () => {
    const dni = prompt("DNI");
    const nombre = prompt("Nombre");

    if (!dni || !nombre) return;

    setLista([
      ...lista,
      {
        dni,
        nombre,
        curso: "",
        empresa: "",
        puesto: "",
        asistencia: "Adicional",
        fuente: "manual"
      }
    ]);
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

  // RESUMEN
  const resumen = {
    total: lista.length,
    presentes: lista.filter(p => p.asistencia === "Presente").length,
    adicionales: lista.filter(p => p.asistencia === "Adicional").length
  };

  return (
    <div className="container py-3">

      <h4 className="text-center mb-3">Asistencia ERS</h4>

      <input type="file" onChange={importarExcel} className="form-control mb-3"/>

      <input
        className="form-control mb-3"
        placeholder="Ingrese DNI"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            marcarAsistencia(e.target.value);
            e.target.value = "";
          }
        }}
      />

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary" onClick={() => setMostrarScanner(!mostrarScanner)}>
          📸 Scanner
        </button>

        <button className="btn btn-success" onClick={agregar}>
          ➕ Agregar
        </button>

        <button className="btn btn-dark" onClick={exportar}>
          ⬇ Descargar
        </button>
      </div>

      {mostrarScanner && <Scanner onScan={marcarAsistencia} />}

      <div className="resumen alert alert-info">
        <span><b>Total:</b> {resumen.total}</span>
        <span><b>Presentes:</b> {resumen.presentes}</span>
        <span><b>Adicionales:</b> {resumen.adicionales}</span>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Curso</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={i}
                className={
                  p.asistencia === "Presente"
                    ? "fila-presente"
                    : p.asistencia === "Adicional"
                    ? "fila-adicional"
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