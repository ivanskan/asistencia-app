import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function TV() {
  const [programados, setProgramados] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [indice, setIndice] = useState(0);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [hora, setHora] = useState(new Date());


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

  // 🔥 asistencia + evento en vivo
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistencia"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setAsistencia(data);

      if (data.length > 0) {
        const ultimo = data[data.length - 1];
        setUltimoRegistro(ultimo);

        // 🔥 PRIORIZAR CURSO
        const cursosTemp = {};

        programados.forEach(p => {
          const key = `${p.curso}||${p.aula || "SIN AULA"}`;
          if (!cursosTemp[key]) cursosTemp[key] = [];
          cursosTemp[key].push(p);
        });

        const cursosKeys = Object.keys(cursosTemp);

        const index = cursosKeys.findIndex(key =>
          key.includes(ultimo.curso)
        );

        if (index !== -1) setIndice(index);

        setTimeout(() => setUltimoRegistro(null), 4000);
      }
    });

    return () => unsub();
  }, [programados]);

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

  // 🔄 rotación automática
  useEffect(() => {
    if (cursosArray.length === 0) return;

    const interval = setInterval(() => {
      setIndice(prev => (prev + 1) % cursosArray.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [cursosArray.length]);

  const cursoActivo = cursosArray[indice];

  return (
    <div className="bg-dark vh-100" >
      <div className="container py-4">
        <div className="row">
          <div className="col-5 pe-3">
              <div className="d-flex justify-content-between" >
                <h1 className="text-warning">ASISTENCIA</h1>
                <div className="fw-bold text-white">
                  <span className="fs-2">{hora.toLocaleTimeString()}</span>
                  <p>{hora.toLocaleDateString()}</p>
                </div>
                {ultimoRegistro && (
                  <div style={{
                    position: "absolute",
                    bottom: "20px",
                    background: "#b3e2d7",
                    padding: "15px",
                    borderRadius: "10px",
                    width: "300px",
                    animation: "fadeIn 0.5s"
                  }}>
                    <div style={{ fontSize: "20px", color: "#171817" }}>
                      👋 BIENVENIDO
                    </div>
                    <div>{ultimoRegistro.nombre}</div>
                    <div>{ultimoRegistro.curso}</div>
                    <div>Aula: {ultimoRegistro.aula}</div>
                  </div>
                )}
              </div>
              <table className="table table-dark table-striped">
                <thead className="border-top border-bottom border-warning">
                  <tr>
                    <th className="text-warning">CURSO</th>
                    <th className="text-warning">AULA</th>
                    <th className="text-warning">ASIST</th>
                  </tr>
                </thead>
                <tbody>
                  {cursosArray.map(([key, lista], i) => {
                    const [curso, aula] = key.split("||");
                    const presentes = lista.filter(p => p.estado === "Presente").length;
                    const activo = i === indice;

                    return (
                      <tr key={i}
                        style={{
                          background: activo ? "#ffffff" : "transparent",
                          fontWeight: activo ? "bold" : "normal",
                          transition: "0.3s",
                          transform: activo ? "4 rem" : "",
                        }}>
                        <td>{curso}</td>
                        <td>{aula}</td>
                        <td>{presentes} / {lista.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>
           
          <div  className="col-7 ps-4">
            {cursoActivo && (
              <>
                <h2 className="text-white">
                  {cursoActivo[0].replace("||", " - ")}
                </h2>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>DNI</th>
                      <th>NOMBRE</th>
                      <th>EMPRESA</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cursoActivo[1]
                      .sort((a, b) =>
                        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
                      )
                      .map((p, i) => (
                        <tr key={i}
                          // style={{
                          //   background: p.estado === "Presente"
                          //     ? "#064e3b"
                          //     : "#3f0000"
                          // }}
                          >
                          <td>{p.dni}</td>
                          <td>{p.nombre}</td>
                          <td>{p.empresa}</td>
                          <td>
                            {p.estado === "Presente" ? "✔" : "✖"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}
              
          </div>
       
        </div>
      </div>
    </div>
  );
}