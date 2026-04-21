import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import "./TVMIN.css";
import logo from "/src/assets/ERS-logo.png";
import eresito from "/src/assets/ersito.webp";

export default function TVMIN() {
  const [programados, setProgramados] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("ok");
  const [hora, setHora] = useState(new Date());
  const [animKey, setAnimKey] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);

  const ultimoId = useRef(null); // 👈 evita repetir audio

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

  // asistencia
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistencia"), (snapshot) => {
      setAsistencia(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  // 🔊 audio
const audios = {
  ok: new Audio("/audio/bienvenido.mp3"),
  warning: new Audio("/audio/registrado.mp3"),
  error: new Audio("/audio/error.mp3")
};

const reproducirAudio = (tipo) => {
  const audio = audios[tipo] || audios.ok;

  audio.currentTime = 0; // reinicia
  audio.play().catch(() => {});
};

  // 🔔 MENSAJES
useEffect(() => {
  const q = query(
    collection(db, "mensajes"),
    orderBy("fecha", "desc"),
    limit(1)
  );

  const unsub = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());

    
    if (data.length > 0) {
      const ultimo = data[0];

      // ✅ AQUÍ sí existe "ultimo"
      const tipo = (ultimo.tipo || "ok").trim().toLowerCase();
      setTipoMensaje(tipo);
      
  if (tipo === "ok") {
  setShowSparkle(true);

  setTimeout(() => {
    setShowSparkle(false);
  }, 1200);
}

      // 🧠 SOPORTA OBJETO Y STRING
      if (typeof ultimo.data === "object") {
        setUltimoRegistro(ultimo.data);
        setAnimKey(prev => prev + 1);
        setTimeout(() => {
          reproducirAudio(tipo);
        }, 150);
      } else {
        const texto = ultimo.data || "";

        setUltimoRegistro({
          aula: "",
          nombre: texto,
          curso: "",
          empresa: ""
        });
        setAnimKey(prev => prev + 1);

        setTimeout(() => {
          reproducirAudio(tipo);
        }, 150);
      }
    }
  });
  

  return () => unsub();
}, []);

  // agrupar cursos
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

  // 🔥 AGREGAR ADICIONALES (CLAVE)
asistencia.forEach(a => {
  const esAdicional = a.asistencia === "Adicional";
  const existeEnProgramados = programados.some(p => p.dni === a.dni);

  if (esAdicional && !existeEnProgramados) {
    const key = `${a.curso}||${a.aula || "SIN AULA"}`;

    if (!cursos[key]) cursos[key] = [];

    cursos[key].push({
      ...a,
      estado: "Adicional"
    });
  }
});

  const cursosArray = Object.entries(cursos);

  const adicionalesUnicos = asistencia.filter(
  a =>
    a.asistencia === "Adicional" &&
    !programados.some(p => p.dni === a.dni)
);

const totalGeneral = programados.length + adicionalesUnicos.length;

const totalPresentes = asistencia.filter(
  a => a.asistencia === "Presente" || a.asistencia === "Adicional"
).length;

  return (
    <div className="tv-min-container">
      <div className="tv-min-body">

        {/* IZQUIERDA */}
        <div className="tv-min-left">
          <div className="d-flex align-items-center">
            <img src={logo} alt="logo" className="d-sm-block w-50" />
            <input type="text" className="input-hide"/>
          </div>

          <table>
            <thead>
              <tr>
                <th className="col-min-curso">CURSO</th>
                <th className="text-end">AULA</th>
                <th className="text-end">ASIST</th>
              </tr>
            </thead>
            <tbody>
              {cursosArray.map(([key, lista], i) => {
                const [curso, aula] = key.split("||");
                const presentes = lista.filter(
                  p => p.estado === "Presente" || p.estado === "Adicional"
                  ).length;

                return (
                  <tr key={i}>
                    <td className="col-min-curso">{curso}</td>
                    <td className="col-min-aula text-end">{aula}</td>
                    <td className="col-min-asist text-end">
                      {presentes}/{lista.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="table-foot mt-2">
            <span className="sumary">TOTAL</span>
            <span className="col-min-caption">
             {totalPresentes}/{totalGeneral}
            </span>
          </div>       
        </div>
          
        {/* DERECHA */}
        <div>

          <div className="tv-min-left-header">
            <div className="tv-min-title">ASISTENCIA</div>

            <div className="tv-min-clock">
              <div className="tv-min-clock-time">
                {hora.toLocaleTimeString()}
              </div>
              <div className="tv-min-clock-date">
                {hora
                  .toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })
                  .toUpperCase()}
              </div>
            </div>
          </div>

          <div className="tv-min-right">
            {showSparkle && (
  <div className="sparkle-container">
    {Array.from({ length: 15 }).map((_, i) => (
      <span key={i} className="sparkle"></span>
    ))}
  </div>
)}

            {ultimoRegistro && (
            // <div
            //   className={`tv-min-welcome ${
            //     tipoMensaje === "ok"
            //       ? "tv-ok"
            //       : tipoMensaje === "warning"
            //       ? "tv-warning"
            //       : "tv-error"
            //   }`}
            // >  
            <div
              key={animKey}
              className={`tv-min-welcome ${
                tipoMensaje === "ok"
                  ? "tv-ok"
                  : tipoMensaje === "warning"
                  ? "tv-warning"
                  : "tv-error"
              }`}
            >

              <p className="tv-min-aula">
              {tipoMensaje === "error"
                ? "❌ No encontrado!"
                : (ultimoRegistro.aula || "")}
              </p>

                <p className="tv-min-nombre">
                  {(ultimoRegistro?.nombre || "").toUpperCase()}
                </p>

                <p className="tv-min-curso">
                  {ultimoRegistro.curso || ""}
                </p>

                <p className="tv-min-empresa">
                  {ultimoRegistro.empresa || ""}
                </p>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
