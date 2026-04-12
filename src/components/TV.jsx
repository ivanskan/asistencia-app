import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function TV() {
  const [programados, setProgramados] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [indice, setIndice] = useState(0);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [hora, setHora] = useState(new Date());

  const [pagina, setPagina] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [dniResaltado, setDniResaltado] = useState(null);

  const porPagina = 15;

  // ⏰ reloj
  useEffect(() => {
    const interval = setInterval(() => {
      setHora(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 programados
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "programados"), (snapshot) => {
      setProgramados(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  // 🔥 asistencia completa
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistencia"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setAsistencia(data);
    });
    return () => unsub();
  }, []);

  // 🔥 último registro (optimizado)
  useEffect(() => {
    const q = query(
      collection(db, "asistencia"),
      orderBy("fecha", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());

      if (data.length > 0) {
        const ultimo = data[0];

        setUltimoRegistro(ultimo);
        setDniResaltado(ultimo.dni);

        setTimeout(() => setDniResaltado(null), 6000);
        setTimeout(() => setUltimoRegistro(null), 4000);

        const cursosTemp = {};

        programados.forEach(p => {
          const key = `${p.curso}||${p.aula || "SIN AULA"}`;
          if (!cursosTemp[key]) cursosTemp[key] = [];

          const presente = asistencia.find(a => a.dni === p.dni);

          cursosTemp[key].push({
            ...p,
            estado: presente ? "Presente" : "Falta"
          });
        });

        const cursosKeys = Object.keys(cursosTemp);
        const index = cursosKeys.findIndex(key =>
          key.includes(ultimo.curso)
        );

        if (index !== -1) setIndice(index);

        const keyUltimo = `${ultimo.curso}||${ultimo.aula || "SIN AULA"}`;
        const listaCurso = cursosTemp[keyUltimo];

        if (listaCurso) {
          const listaOrdenada = [...listaCurso].sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
          );

          const indexPersona = listaOrdenada.findIndex(p => p.dni === ultimo.dni);

          if (indexPersona !== -1) {
            const paginaNueva = Math.floor(indexPersona / porPagina);

            setAnimando(true);

            setTimeout(() => {
              setPagina(paginaNueva);
              setAnimando(false);
            }, 300);
          }
        }
      }
    });

    return () => unsub();
  }, [programados, asistencia]);

  // 📊 agrupar cursos
  const cursos = {};
  programados.forEach(p => {
    const key = `${p.curso}||${p.aula || "SIN AULA"}`;
    if (!cursos[key]) cursos[key] = [];

    const presente = asistencia.find(a => a.dni === p.dni);

    cursos[key].push({
      ...p,
      estado: presente ? "Presente" : "Falta"
    });
  });

  const cursosArray = Object.entries(cursos);
  const cursoActivo = cursosArray[indice];

  // 🔄 rotación cursos
  useEffect(() => {
    if (cursosArray.length === 0) return;

    const interval = setInterval(() => {
      setIndice(prev => (prev + 1) % cursosArray.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [cursosArray.length]);

  // 🔄 paginación automática
  const totalParticipantes = cursoActivo ? cursoActivo[1].length : 0;

  useEffect(() => {
    if (!cursoActivo) return;
    if (totalParticipantes <= porPagina) return;

    const totalPaginas = Math.ceil(totalParticipantes / porPagina);

    const interval = setInterval(() => {
      setPagina(prev => (prev + 1) % totalPaginas);
    }, 6000);

    return () => clearInterval(interval);
  }, [indice, totalParticipantes]);

  // reset página
  useEffect(() => {
    setPagina(0);
  }, [indice]);

  // 📄 paginación data
  let participantesPaginados = { data: [], totalPaginas: 1 };

  if (cursoActivo) {
    const lista = [...cursoActivo[1]].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );

    const totalPaginas = Math.ceil(lista.length / porPagina);
    const inicio = pagina * porPagina;

    participantesPaginados = {
      data: lista.slice(inicio, inicio + porPagina),
      totalPaginas
    };
  }

return (
  <div className="bg-dark text-white vh-100 d-flex flex-column">

    {/* HEADER */}
    <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary">
      <h1 className="text-warning display-5 m-0">ASISTENCIA</h1>

      <div className="text-end">
        <div className="display-4 fw-bold">
          {hora.toLocaleTimeString()}
        </div>
        <div className="fs-5 text-uppercase">
          {hora.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>

    {/* CONTENIDO */}
    <div className="flex-grow-1 d-flex overflow-hidden">

      {/* IZQUIERDA - CURSOS */}
      <div 
        className="p-3 border-end border-secondary"
        style={{ width: "30%" }}
      >
        <h4 className="text-warning mb-3">CURSOS</h4>

        <table className="table table-dark table-striped fs-5">
          <thead>
            <tr>
              <th>CURSO</th>
              <th>AULA</th>
              <th>ASIST</th>
            </tr>
          </thead>
          <tbody>
            {cursosArray.map(([key, lista], i) => {
              const [curso, aula] = key.split("||");
              const presentes = lista.filter(p => p.estado === "Presente").length;
              const activo = i === indice;

              return (
                <tr
                  key={i}
                  className={activo ? "table-info fw-bold shadow" : ""}
                >
                  <td>{curso}</td>
                  <td>{aula}</td>
                  <td>{presentes}/{lista.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DERECHA - PARTICIPANTES */}
      <div className="p-3" style={{ width: "70%" }}>

        {cursoActivo && (
          <>
            <h2 className="mb-3 display-6 text-warning">
              {cursoActivo[0].replace("||", " - ")}
            </h2>

            {/* PAGINACIÓN */}
            {participantesPaginados.totalPaginas > 1 && (
              <div className="mb-2 fs-5 text-info">
                Página {pagina + 1} / {participantesPaginados.totalPaginas}
              </div>
            )}

            <div style={{ height: "75vh", overflow: "hidden" }}>
              <table className="table table-bordered table-striped fs-5">
                <thead className="table-dark">
                  <tr>
                    <th>DNI</th>
                    <th>NOMBRE</th>
                    <th>EMPRESA</th>
                    <th>✔</th>
                  </tr>
                </thead>

                <tbody>
                  {participantesPaginados.data.map((p, i) => {
                    const esUltimo = p.dni === dniResaltado;

                    return (
                      <tr
                        key={i}
                        className={esUltimo ? "table-warning fw-bold" : ""}
                      >
                        <td>{p.dni}</td>
                        <td>{p.nombre}</td>
                        <td>{p.empresa}</td>
                        <td className={p.estado === "Presente" ? "text-success text-center" : "text-danger text-center"}>
                          {p.estado === "Presente" ? "✔" : "✖"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>

    {/* FOOTER - ALERTA */}
    <div className="bg-success text-dark px-4 py-3 fw-bold fs-4">
      {ultimoRegistro
        ? `👋 ${ultimoRegistro.nombre} - ${ultimoRegistro.curso} (${ultimoRegistro.aula})`
        : "Sistema de asistencia en tiempo real"}
    </div>
  </div>
);
}