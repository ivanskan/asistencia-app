import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import Scanner from "./components/Scanner";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs
} from "firebase/firestore";

function App() {
  const [baseExcel, setBaseExcel] = useState([]); // programados (local)
  const [programados, setProgramados] = useState([]); // 🔥 firebase
  const [lista, setLista] = useState([]); // asistencia
  const [mostrarScanner, setMostrarScanner] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [dniInput, setDniInput] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevo, setNuevo] = useState({
    dni: "",
    nombre: "",
    curso: "",
    empresa: ""
  });

  const ultimoScan = useRef("");

  // 🔄 ESCUCHAR PROGRAMADOS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "programados"), (snapshot) => {
      const datos = snapshot.docs.map(doc => doc.data());
      setProgramados(datos);
    });

    return () => unsub();
  }, []);

  // 🔄 ESCUCHAR ASISTENCIA
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistencia"), (snapshot) => {
      const datos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLista(datos);
    });

    return () => unsub();
  }, []);

  // 📳 Vibración
  const vibrar = (tipo = "ok") => {
    if (!navigator.vibrate) return;
    if (tipo === "ok") navigator.vibrate(100);
    else if (tipo === "error") navigator.vibrate([100, 50, 100]);
    else navigator.vibrate([50, 50, 50]);
  };

  // 📂 IMPORTAR EXCEL (LOCAL)
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
        empresa: row["EMPRESA"] || ""
      }));

      setBaseExcel(data);
    };

    reader.readAsBinaryString(file);
  };

  // ☁️ SUBIR EXCEL A FIREBASE
  const subirProgramados = async () => {
    try {
      for (const p of baseExcel) {
        await addDoc(collection(db, "programados"), p);
      }

      setMensaje({ tipo: "ok", texto: "☁️ Programados subidos" });
      setTimeout(() => setMensaje(null), 2000);

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ REGISTRAR
  const marcarAsistencia = async (dniRaw) => {
    const dni = dniRaw.trim().toUpperCase();
    setDniInput(dni);

    if (dni === ultimoScan.current) return;
    ultimoScan.current = dni;
    setTimeout(() => (ultimoScan.current = ""), 2500);

    try {
      const q = query(collection(db, "asistencia"), where("dni", "==", dni));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();

        setMensaje({
          tipo: "warning",
          texto: `⚠️ Ya registrado\n${docData.nombre}`
        });

        vibrar("warning");
        setTimeout(() => setMensaje(null), 2000);
        return;
      }

      const persona = programados.find(p => p.dni === dni);

      if (!persona) {
        setMensaje({ tipo: "error", texto: `❌ DNI ${dni} no encontrado` });
        vibrar("error");
        setTimeout(() => setMensaje(null), 2000);
        return;
      }

      await addDoc(collection(db, "asistencia"), {
        dni,
        nombre: persona.nombre,
        curso: persona.curso,
        empresa: persona.empresa || "",
        asistencia: "Presente",
        hora: new Date().toLocaleTimeString(),
        fecha: new Date().toISOString()
      });

      setMensaje({
        tipo: "ok",
        texto: `✅ ${persona.nombre}\n📚 ${persona.curso}\n🆔 ${dni}`
      });

      vibrar("ok");

    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "error", texto: "❌ Error Firebase" });
      setTimeout(() => setMensaje(null), 2000);
    }
  };

  const handleManual = () => {
    if (!dniInput) return;
    marcarAsistencia(dniInput);
    setDniInput("");
  };

  // ➕ AGREGAR
  const guardarNuevo = async () => {
    if (!nuevo.dni || !nuevo.nombre) {
      setMensaje({ tipo: "error", texto: "❌ DNI y Nombre obligatorios" });
      setTimeout(() => setMensaje(null), 2000);
      return;
    }

    await addDoc(collection(db, "asistencia"), {
      dni: nuevo.dni.toUpperCase(),
      nombre: nuevo.nombre,
      curso: nuevo.curso,
      empresa: nuevo.empresa,
      asistencia: "Adicional",
      hora: new Date().toLocaleTimeString(),
      fecha: new Date().toISOString()
    });

    setMensaje({
      tipo: "ok",
      texto: `✅ Agregado: ${nuevo.nombre}`
    });

    setTimeout(() => setMensaje(null), 2000);

    setNuevo({ dni: "", nombre: "", curso: "", empresa: "" });
    setMostrarModal(false);
  };

  // ⬇ EXPORTAR
  const exportar = () => {
    const data = lista.map((p) => ({
      DNI: p.dni,
      NOMBRE: p.nombre,
      CURSO: p.curso,
      EMPRESA: p.empresa,
      ASISTENCIA: p.asistencia,
      HORA: p.hora
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ASISTENCIA");

    XLSX.writeFile(wb, "asistencia.xlsx");
  };

  const total = programados.length;
  const presentes = lista.filter(p => p.asistencia === "Presente").length;
  const adicionales = lista.filter(p => p.asistencia === "Adicional").length;

  return (
    <div className="container py-3">

      <h4 className="text-center mb-3">Asistencia ERS</h4>

      <input type="file" onChange={importarExcel} className="form-control mb-2"/>

      <button className="btn btn-warning mb-3 w-100" onClick={subirProgramados}>
        ☁️ Subir Programados
      </button>

      {mensaje && (
        <div className={`alert text-center ${
          mensaje.tipo === "ok" ? "alert-success" :
          mensaje.tipo === "warning" ? "alert-warning" :
          "alert-danger"
        }`}>
          <pre style={{margin:0}}>{mensaje.texto}</pre>
        </div>
      )}

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Ingrese DNI o CE"
          value={dniInput}
          onChange={(e) => setDniInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManual()}
        />
        <button className="btn btn-primary" onClick={handleManual}>
          ✔
        </button>
      </div>

      <div className="d-flex gap-2 mb-3 justify-content-between">
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setMostrarScanner(!mostrarScanner)}>
            📸
          </button>
          <button className="btn btn-success" onClick={() => setMostrarModal(true)}>
            ➕
          </button>
        </div>

        <button className="btn btn-dark" onClick={exportar}>
          ⬇
        </button>
      </div>

      {mostrarScanner && <Scanner onScan={marcarAsistencia} />}

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal d-block" style={{background:"rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Nuevo participante</h5>

              <input className="form-control mb-2" placeholder="DNI"
                value={nuevo.dni}
                onChange={(e) => setNuevo({ ...nuevo, dni: e.target.value })}
              />
              <input className="form-control mb-2" placeholder="Nombre"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              />
              <input className="form-control mb-2" placeholder="Curso"
                value={nuevo.curso}
                onChange={(e) => setNuevo({ ...nuevo, curso: e.target.value })}
              />
              <input className="form-control mb-2" placeholder="Empresa"
                value={nuevo.empresa}
                onChange={(e) => setNuevo({ ...nuevo, empresa: e.target.value })}
              />

              <div className="d-flex gap-2">
                <button className="btn btn-success w-100" onClick={guardarNuevo}>
                  Guardar
                </button>
                <button className="btn btn-secondary w-100" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="alert alert-info">
        <b>Total:</b> {total} |
        <b> Presentes:</b> {presentes} |
        <b> Adicionales:</b> {adicionales}
      </div>

      {/* TABLA */}
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

            {/* PROGRAMADOS */}
            {programados.map((p, i) => {
              const asistente = lista.find(a => a.dni === p.dni);

              return (
                <tr key={i}
                  className={asistente?.asistencia === "Presente" ? "table-success" : ""}>
                  <td>{p.dni}</td>
                  <td>{p.nombre}</td>
                  <td>{p.curso}</td>
                  <td>{asistente ? asistente.asistencia : "Falta"}</td>
                </tr>
              );
            })}

            {/* ADICIONALES */}
            {lista
              .filter(p => p.asistencia === "Adicional")
              .map((p, i) => (
                <tr key={"ad-" + i} className="table-warning">
                  <td>{p.dni}</td>
                  <td>{p.nombre}</td>
                  <td>{p.curso}</td>
                  <td>Adicional</td>
                </tr>
              ))}

          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;