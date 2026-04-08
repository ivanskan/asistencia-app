import { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import Scanner from "./components/Scanner";
import { db } from "./firebase";
import logo from "/src/assets/ERS-logo.png";
import logoMin from "/src/assets/ERS-logo-min.png";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs, 
  deleteDoc 
} from "firebase/firestore";

function App() {
  const [baseExcel, setBaseExcel] = useState([]); // programados (local)
  const [programados, setProgramados] = useState([]); // firebase
  const [lista, setLista] = useState([]); // asistencia
  const [mostrarScanner, setMostrarScanner] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [dniInput, setDniInput] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [errorForm, setErrorForm] = useState(null);
  const [ordenCampo, setOrdenCampo] = useState("nombre");
  const [ordenDireccion, setOrdenDireccion] = useState("asc");
  const [nuevo, setNuevo] = useState({
    dni: "",
    nombre: "",
    curso: "",
    empresa: "",
    aula: ""
  });

  const ultimoScan = useRef("");

  // ESCUCHAR PROGRAMADOS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "programados"), (snapshot) => {
      const datos = snapshot.docs.map(doc => doc.data());
      setProgramados(datos);
    });

    return () => unsub();
  }, []);

  // ESCUCHAR ASISTENCIA
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

  // Vibración
  const vibrar = (tipo = "ok") => {
    if (!navigator.vibrate) return;
    if (tipo === "ok") navigator.vibrate(100);
    else if (tipo === "error") navigator.vibrate([100, 50, 100]);
    else navigator.vibrate([50, 50, 50]);
  };

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

  // ☁️ SUBIR EXCEL A FIREBASE

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

  // REGISTRAR
  const marcarAsistencia = async (dniRaw) => {
    const dni = dniRaw.trim().toUpperCase();
    // solo números y longitud exacta
    if (!/^\d{8}$/.test(dni)) {
      return;
    }
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
          texto: `📚 ${docData.curso} - AULA ${docData.aula} \n🤦‍♂️ ${docData.nombre}\n🆔 ${docData.dni}`
        });

        vibrar("warning");
        // setTimeout(() => setMensaje(null), 2000);
        return;
      }

      const persona = programados.find(p => p.dni === dni);

      if (!persona) {
        setMensaje({ tipo: "error", texto: `❌ DNI ${dni} No encontrado` });
        vibrar("error");
        // setTimeout(() => setMensaje(null), 2000);
        return;
      }

      await addDoc(collection(db, "asistencia"), {
        dni,
        nombre: persona.nombre,
        curso: persona.curso,
        empresa: persona.empresa || "",
        aula: persona.aula || "",
        asistencia: "Presente",
        hora: new Date().toLocaleTimeString(),
        fecha: new Date().toISOString()
      });

      setMensaje({
        tipo: "ok",
        texto: `📚 ${persona.curso} - AULA ${persona.aula} \n😎 ${persona.nombre}\n🆔 ${dni}`
      });

      vibrar("ok");

    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "error", texto: "❌ Error BD" });
      setTimeout(() => setMensaje(null), 2000);
    }
  };

  const handleManual = () => {
    if (!dniInput) return;
    marcarAsistencia(dniInput);
    setDniInput("");
  };

  // AGREGAR
const guardarNuevo = async () => {
 if (!nuevo.dni || !nuevo.nombre || !nuevo.curso || !nuevo.empresa || !nuevo.aula) {
  setErrorForm("❌ Todos los campos son obligatorios");

  setTimeout(() => setErrorForm(null), 2000); // 👈 auto desaparece
  return;
}
  setErrorForm(null);

  await addDoc(collection(db, "asistencia"), {
    dni: nuevo.dni.toUpperCase(),
    nombre: nuevo.nombre,
    curso: nuevo.curso,
    empresa: nuevo.empresa,
    aula: nuevo.aula,
    asistencia: "Adicional",
    hora: new Date().toLocaleTimeString(),
    fecha: new Date().toISOString()
  });

  setMensaje({
    tipo: "ok",
    texto: `✅ Agregado: ${nuevo.nombre}`
  });

  setTimeout(() => setMensaje(null), 2000);

  setNuevo({ dni: "", nombre: "", curso: "", empresa: "", aula: "" });
  setMostrarModal(false);
};

  // ⬇ EXPORTAR
  const exportar = () => {
    const data = lista.map((p) => ({
      DNI: p.dni,
      NOMBRE: p.nombre,
      CURSO: p.curso,
      EMPRESA: p.empresa,
      AULA: p.aula,
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

//   const programadosOrdenados = useMemo(() => {
//   return [...programados].sort((a, b) => {
//     const nombreA = (a?.nombre || "").toString();
//     const nombreB = (b?.nombre || "").toString();
//     return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
//   });
// }, [programados]);

const programadosOrdenados = useMemo(() => {
  return [...programados].sort((a, b) => {
    const valorA = (a?.[ordenCampo] || "").toString().toLowerCase();
    const valorB = (b?.[ordenCampo] || "").toString().toLowerCase();

    if (ordenDireccion === "asc") {
      return valorA.localeCompare(valorB, "es", { sensitivity: "base" });
    } else {
      return valorB.localeCompare(valorA, "es", { sensitivity: "base" });
    }
  });
}, [programados, ordenCampo, ordenDireccion]);

const cambiarOrden = (campo) => {
  if (ordenCampo === campo) {
    setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc");
  } else {
    setOrdenCampo(campo);
    setOrdenDireccion("asc");
  }
};

  return (
    <div className="container py-3">

      <div className="mb-1">
        <img src={logo} alt="logo" className="d-none d-sm-block" style={{ height: "50px" }}/>
        <img src={logoMin}alt="logo" className="d-block d-sm-none" style={{ height: "45px" }}/>
      </div>
      <h4 className="mb-4 text-center fw-bold text-primary">ASISTENCIA ERS</h4>

      {/* <div className="d-flex mb-3"> */}
      <div className="d-flex mb-3 d-none">
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

      <div className="d-flex gap-2 mb-3">
       <input
          type="text"
          inputMode="numeric"
          className="form-control"
          placeholder="Ingrese DNI"
          value={dniInput}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, ""); // solo números

            if (valor.length > 8) {
              valor = valor.slice(0, 8); // limitar a 8
            }

            setDniInput(valor);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleManual()}
        />
        <button className="btn btn-primary" onClick={handleManual}>
          <span className="fw-semibold"> ✔&nbsp;Registrar</span>
        </button>
      </div>

      <div className="d-flex gap-2 mb-3 justify-content-between">
        <div className="d-flex gap-2">
          <button className="btn btn-primary p-1" onClick={() => setMostrarScanner(!mostrarScanner)}>
            <svg style={{width:"30px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="rgb(255, 255, 255)" d="M213.1 128.8L202.7 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L437.3 160L426.9 128.8C420.4 109.2 402.1 96 381.4 96L258.6 96C237.9 96 219.6 109.2 213.1 128.8zM320 256C373 256 416 299 416 352C416 405 373 448 320 448C267 448 224 405 224 352C224 299 267 256 320 256z"/></svg>
            <span className="fw-semibold ps-1">Scanner</span>
          </button>
          <button className="btn btn-success p-1"
            onClick={() => {
              setNuevo({ dni: "", nombre: "", curso: "", empresa: "", aula: "" }); // limpiar
              setErrorForm(null); // limpiar error
              setMostrarModal(true);
            }}>
            <svg style={{width:"30px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="rgb(255, 255, 255)" d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>
            <span className="fw-semibold ps-1">Agregar</span>
          </button>
        </div>

        <button className="btn btn-dark p-1" onClick={exportar}>
            <svg style={{width:"30px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="rgb(255, 255, 255)" d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z"/></svg>               
        </button>
       
      </div>

      {mostrarScanner && <Scanner onScan={marcarAsistencia} />}

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal d-block" style={{background:"rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Nuevo participante</h5>
              {errorForm && (
                <div className="alert alert-danger py-2">
                  {errorForm}
                </div>
              )}

              <input className="form-control mb-2" placeholder="DNI"
                value={nuevo.dni}
                onChange={(e) => setNuevo({ ...nuevo, dni: e.target.value })}
              />
              <input className="form-control mb-2" placeholder="Apellidos y Nombres"
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
              <input className="form-control mb-2" placeholder="Aula"
                value={nuevo.aula}
                onChange={(e) => setNuevo({ ...nuevo, aula: e.target.value })}
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
              <th onClick={() => cambiarOrden("dni")} style={{cursor:"pointer"}}>DNI</th>
              <th onClick={() => cambiarOrden("nombre")} style={{cursor:"pointer"}}>NOMBRE</th>
              <th onClick={() => cambiarOrden("curso")} style={{cursor:"pointer"}}>CURSO</th>
              <th onClick={() => cambiarOrden("empresa")} style={{cursor:"pointer"}}>EMPRESA</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>

            {/* PROGRAMADOS */}
            
            {programadosOrdenados.map((p, i) => {
              const asistente = lista.find(a => a.dni === p.dni);

              return (
                <tr key={i}
                  className={asistente?.asistencia === "Presente" ? "table-success" : ""}>
                  <td>{p.dni}</td>
                  <td>{p.nombre}</td>
                  <td>{p.curso}</td>
                   <td>{p.empresa}</td>
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
                  <td>{p.empresa}</td>
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