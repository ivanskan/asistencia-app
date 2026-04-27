import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { db } from "../firebase";
import instructores from "/src/data/instructores.json";
import {
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

function Adm() {

  const [excelData, setExcelData] = useState([]);
  const [programados, setProgramados] = useState([]);
  const [filaAbierta, setFilaAbierta] = useState(null);

  const [form, setForm] = useState({
    fecha: "",
    turno: "mañana",
    curso: "",
    aula: "",
    instructorId: ""
  });

  const [toast, setToast] = useState({
  show: false,
  message: "",
  type: "success"
});

  const [pagina, setPagina] = useState(1);
  const porPagina = 20;

  // ESCUCHAR PROGRAMADOS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "programados"), (snapshot) => {
      const datos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProgramados(datos);
    });

    return () => unsub();
  }, []);

  // AGRUPAR
 const programaciones = useMemo(() => {
  const mapa = {};

  programados.forEach(p => {
    const key = `${p.fecha}_${p.turno}_${p.curso}`;

    if (!mapa[key]) {
      mapa[key] = {
        fecha: p.fecha,
        turno: p.turno,
        curso: p.curso,
        total: 0,
        instructorNombre: p.instructorNombre || "—"
      };
    }

    mapa[key].total += 1;
  });

  return Object.values(mapa).sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  );
}, [programados]);

  const totalPaginas = Math.ceil(programaciones.length / porPagina);

  const programacionesPaginadas = programaciones.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  // IMPORTAR EXCEL
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

  // SUBIR PROGRAMADOS
  const subir = async () => {
    if (!form.fecha || !form.curso || excelData.length === 0) {
      alert("Faltan datos");
      return;
    }

    if (!form.instructorId) {
      alert("Selecciona instructor");
      return;
    }

    try {
      const instructorSeleccionado = instructores.find(
        i => String(i.id) === String(form.instructorId)
      );

      if (!instructorSeleccionado) {
        alert("Instructor no encontrado");
        return;
      }

      await Promise.all(
        excelData.map(p =>
          addDoc(collection(db, "programados"), {
            ...p,
            fecha: form.fecha,
            turno: form.turno,
            curso: form.curso,
            aula: form.aula,

            // ✅ DATOS DEL INSTRUCTOR
            instructorId: instructorSeleccionado.id,
            instructorNombre: instructorSeleccionado.nombre,
            instructorFoto: instructorSeleccionado.foto
          })
        )
      );

      alert(`✅ ${excelData.length} registros subidos`);

      setExcelData([]);

      setForm({
        fecha: "",
        turno: "mañana",
        curso: "",
        aula: "",
        instructorId: ""
      });

      setPagina(1);
      document.querySelector('input[type="file"]').value = "";

    } catch (err) {
      console.error(err);
      alert("Error al subir");
    }
  };

  const eliminarCursoDirecto = async (fecha, turno, curso) => {
    try {
      const qProg = query(
        collection(db, "programados"),
        where("fecha", "==", fecha),
        where("turno", "==", turno),
        where("curso", "==", curso)
      );

      const snapProg = await getDocs(qProg);

      const qAsis = query(
        collection(db, "asistencia"),
        where("fecha", "==", fecha),
        where("turno", "==", turno),
        where("curso", "==", curso)
      );

      const snapAsis = await getDocs(qAsis);

      const total = snapProg.size + snapAsis.size;

      if (!window.confirm(`Eliminar ${total} registros de ${curso}?`)) return;

      await Promise.all(snapProg.docs.map(doc => deleteDoc(doc.ref)));
      await Promise.all(snapAsis.docs.map(doc => deleteDoc(doc.ref)));

      setToast({
        show: true,
        message: `Curso ${curso} eliminado (${total})`,
        type: "success"
      });

    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: "Error eliminando curso",
        type: "danger"
      });
    }
  };
  useEffect(() => {
  if (pagina > totalPaginas) {
    setPagina(1);
  }
}, [programaciones]);

  return (
    <div className="container py-3">

      <h4 className="mb-3">⚙️ Administración</h4>

      <input
        type="date"
        className="form-control mb-2"
        value={form.fecha}
        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
      />

      <select
        className="form-control mb-2"
        value={form.turno}
        onChange={(e) => setForm({ ...form, turno: e.target.value })}
      >
        <option value="mañana">Turno Mañana</option>
        <option value="tarde">Turno Tarde</option>
      </select>

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

      {/* ✅ SELECT INSTRUCTOR */}
      <select
        className="form-control mb-2"
        value={form.instructorId}
        onChange={(e) =>
          setForm({ ...form, instructorId: e.target.value })
        }
      >
        <option value="">Seleccionar instructor</option>
        {instructores.map((ins) => (
          <option key={ins.id} value={ins.id}>
            {ins.nombre}
          </option>
        ))}
      </select>

      <input type="file" className="form-control mb-2" onChange={importarExcel} />
      {excelData.length > 0 && (
  <div className="alert alert-info py-2">
    📊 {excelData.length} registros listos para subir
  </div>
)}

    <button
  className="btn btn-success w-100"
  onClick={subir}
  disabled={excelData.length === 0}
>
  ☁️ Subir Programados
</button>

      {/* TABLA */}
      <div className="mt-4">
        <h5>📅 Programaciones</h5>

        <table className="table table-bordered table-sm">
<thead className="table-dark">
  <tr>
    <th>Fecha</th>
    <th>Turno</th>
    <th>Curso</th>
    <th>Instructor</th>
    <th>Programados</th>
    <th>Acciones</th>
  </tr>
</thead>

<tbody>
  {programacionesPaginadas.map((p) => (
    <tr key={`${p.fecha}-${p.turno}-${p.curso}`}>
      <td>{p.fecha}</td>
      <td>{p.turno}</td>
      <td>{p.curso}</td>
      <td>{p.instructorNombre}</td>
      <td>{p.total}</td>

      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={() =>
            eliminarCursoDirecto(p.fecha, p.turno, p.curso)
          }
        >
          🗑️ Eliminar
        </button>
      </td>
    </tr>
  ))}
</tbody>
</table>
        <div className="d-flex justify-content-between align-items-center mt-2">
  
  <button
    className="btn btn-sm btn-secondary"
    disabled={pagina === 1}
    onClick={() => setPagina(pagina - 1)}
  >
    ⬅ Anterior
  </button>

  <span>
    Página {pagina} de {totalPaginas}
  </span>

  <button
    className="btn btn-sm btn-secondary"
    disabled={pagina === totalPaginas}
    onClick={() => setPagina(pagina + 1)}
  >
    Siguiente ➡
  </button>

</div>
      </div>


    </div>
  );
}

export default Adm;