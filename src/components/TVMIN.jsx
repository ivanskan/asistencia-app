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
import ersito from "/src/assets/ersito.jpeg";
import GraficoCursosBar from "./GraficoCursosBar";

export default function TVMIN() {
  const [programados, setProgramados] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("ok");
  const [hora, setHora] = useState(new Date());

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
  const reproducirAudio = async (persona) => {
    if (!persona) return;

    const texto = `${persona.nombre || ""}, curso ${persona.curso || ""}, aula ${persona.aula || ""}`;

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=es&client=tw-ob`;

      const audio = new Audio(url);
      audio.play().catch(() => {
        const speech = new SpeechSynthesisUtterance(texto);
        speech.lang = "es-ES";
        speech.rate = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
      });
    } catch (e) {
      console.log("error audio");
    }
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

      // 🧠 SOPORTA OBJETO Y STRING
      if (typeof ultimo.data === "object") {
        setUltimoRegistro(ultimo.data);
        reproducirAudio(ultimo.data);
      } else {
        const texto = ultimo.data || "";

        setUltimoRegistro({
          aula: "",
          nombre: texto,
          curso: "",
          empresa: ""
        });

        reproducirAudio({
          nombre: texto,
          curso: "",
          aula: ""
        });
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

          <img src={logo} alt="logo" className="d-sm-block w-50 btn" />

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

          <div className="table-foot">
            <span className="sumary">TOTAL</span>
            <span className="col-min-caption">
             {totalPresentes}/{totalGeneral}
            </span>
          </div>
          <div className="grafico-min">
            <GraficoCursosBar 
              programados={programados} 
              asistencia={asistencia} 
            />
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

            {ultimoRegistro && (
            <div
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
