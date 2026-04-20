import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore";

function Adm() {

  const [excelData, setExcelData] = useState([]);
  const [programados, setProgramados] = useState([]);
  const [detalle, setDetalle] = useState(null);

  const [form, setForm] = useState({
    fecha: "",
    turno: "mañana",
    curso: "",
    aula: "",
    instructor: ""
  });

  // 📄 PAGINACIÓN
  const [pagina, setPagina] = useState(1);
  const porPagina = 20;

  // 🔥 ESCUCHAR PROGRAMADOS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "programados"), (snapshot) => {
      const datos = snapshot.docs.map(doc => doc.data());
      setProgramados(datos);
    });

    return () => unsub();
  }, []);

  // 📊 AGRUPAR PROGRAMACIONES
  const programaciones = useMemo(() => {
    const mapa = {};

    programados.forEach(p => {
      const key = `${p.fecha}_${p.turno}`;

      if (!mapa[key]) {
        mapa[key] = {
          fecha: p.fecha,
          turno: p.turno,
          total: 0,
          cursos: new Set()
        };
      }

      mapa[key].total += 1;
      mapa[key].cursos.add(p.curso);
    });

    return Object.values(mapa)
      .map(p => ({
        ...p,
        cursosCount: p.cursos.size
      }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

  }, [programados]);

  // 📄 PAGINADO
  const totalPaginas = Math.ceil(programaciones.length / porPagina);

  const programacionesPaginadas = programaciones.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  // 📥 IMPORTAR EXCEL
  const importarExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const limpio = data.map(row => ({
        dni: String(row["DNI"] || "").trim(),
        nombre: row["NOMBRE"] || "",
        empresa: row["EMPRESA"] || ""
      }));

      setExcelData(limpio);
    };

    reader.readAsBinaryString(file);
  };

  // ☁️ SUBIR
  const subir = async () => {
    if (!form.fecha || !form.curso || excelData.length === 0) {
      alert("Faltan datos");
      return;
    }

    try {
      await Promise.all(
        excelData.map(p =>
          addDoc(collection(db, "programados"), {
            ...p,
            ...form
          })
        )
      );

      alert(`✅ ${excelData.length} registros subidos`);

      // 🔥 LIMPIAR TODO
      setExcelData([]);
      setForm({
        fecha: "",
        turno: "mañana",
        curso: "",
        aula: "",
        instructor: ""
      });

      setPagina(1);

      // limpiar input file
      document.querySelector('input[type="file"]').value = "";

    } catch (err) {
      console.error(err);
      alert("Error al subir");
    }
  };

  const abrirDetalle = (prog) => {

  const filtrados = programados.filter(
    p => p.fecha === prog.fecha && p.turno === prog.turno
  );

  const cursos = [...new Set(filtrados.map(p => p.curso))];
  const aulas = [...new Set(filtrados.map(p => p.aula))];
  const instructores = [...new Set(filtrados.map(p => p.instructor))];

  setDetalle({
    ...prog,
    cursos,
    aulas,
    instructores,
    lista: filtrados
  });
};

  return (
    <div className="container py-3">

      <h4 className="mb-3">⚙️ Administración</h4>

      {/* 📅 FECHA */}
      <input
        type="date"
        className="form-control mb-2"
        value={form.fecha}
        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
      />

      {/* 🕐 TURNO */}
      <select
        className="form-control mb-2"
        value={form.turno}
        onChange={(e) => setForm({ ...form, turno: e.target.value })}
      >
        <option value="mañana">Turno Mañana</option>
        <option value="tarde">Turno Tarde</option>
      </select>

      {/* 🏫 CAMPOS */}
      <input
        className="form-control mb-2"
        placeholder="Curso"
        value={form.curso}
        onChange={(e) => setForm({ ...form, curso: e.target.value.toUpperCase() })}
      />

      <input
        className="form-control mb-2"
        placeholder="Aula"
        value={form.aula}
        onChange={(e) => setForm({ ...form, aula: e.target.value.toUpperCase() })}
      />

      <input
        className="form-control mb-2"
        placeholder="Instructor"
        value={form.instructor}
        onChange={(e) => setForm({ ...form, instructor: e.target.value.toUpperCase() })}
      />

      {/* 📂 EXCEL */}
      <input
        type="file"
        className="form-control mb-2"
        onChange={importarExcel}
      />

      <button className="btn btn-success w-100" onClick={subir}>
        ☁️ Subir Programados
      </button>

      {/* 👁️ PREVIEW */}
      {excelData.length > 0 && (
        <div className="mt-2 alert alert-info py-2">
          📄 {excelData.length} registros listos para subir
        </div>
      )}

      {/* 📋 TABLA PROGRAMACIONES */}
      <div className="mt-4">
        <h5>📅 Programaciones</h5>

        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead className="table-dark">
              <tr>
                <th>Fecha</th>
                <th>Turno</th>
                <th>Cursos</th>
                <th>Programados</th>
              </tr>
            </thead>

            <tbody>
              {programacionesPaginadas.map((p, i) => (
                <tr
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => abrirDetalle(p)}
                  >
                  <td>{p.fecha}</td>
                  <td>{p.turno}</td>
                  <td>{p.cursosCount}</td>
                  <td>{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detalle && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content p-3">

                <h5 className="mb-3">
                  📅 {detalle.fecha} | 🕐 {detalle.turno}
                </h5>

                <div className="mb-2">
                  <b>👥 Programados:</b> {detalle.total}
                </div>

                <div className="mb-2">
                  <b>📚 Cursos:</b> {detalle.cursos.join(", ")}
                </div>

                <div className="mb-2">
                  <b>🏫 Aulas:</b> {detalle.aulas.join(", ")}
                </div>

                <div className="mb-3">
                  <b>👨‍🏫 Instructor(es):</b> {detalle.instructores.join(", ")}
                </div>

                {/* TABLA DETALLE */}
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>DNI</th>
                        <th>Nombre</th>
                        <th>Empresa</th>
                        <th>Curso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.lista.map((p, i) => (
                        <tr key={i}>
                          <td>{p.dni}</td>
                          <td>{p.nombre}</td>
                          <td>{p.empresa}</td>
                          <td>{p.curso}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  className="btn btn-secondary mt-3 w-100"
                  onClick={() => setDetalle(null)}
                >
                  Cerrar
                </button>

              </div>
            </div>
          </div>
        )}

        {/* 🔢 PAGINACIÓN */}
        <div className="d-flex justify-content-between align-items-center">

          <small>
            Página {pagina} de {totalPaginas || 1}
          </small>

          <div>
            <button
              className="btn btn-sm btn-secondary me-2"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              ←
            </button>

            <button
              className="btn btn-sm btn-secondary"
              disabled={pagina === totalPaginas || totalPaginas === 0}
              onClick={() => setPagina(pagina + 1)}
            >
              →
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Adm;