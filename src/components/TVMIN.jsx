import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import "./TVMIN.css";
import logo from "/src/assets/ERS-logo.png";

export default function TVMIN() {
  const [programados, setProgramados] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
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

  // asistencia
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistencia"), (snapshot) => {
      setAsistencia(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  // 🔊 audio
  const reproducirAudio = async (persona) => {
    const texto = `${persona.nombre}, curso ${persona.curso}, aula ${persona.aula}`;

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=es&client=tw-ob`;

      const audio = new Audio(url);
      audio.play().catch(() => {
        console.log("🔇 fallback a voz nativa");

        // fallback si falla
        const speech = new SpeechSynthesisUtterance(texto);
        speech.lang = "es-ES";
        speech.rate = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
      });

    } catch (e) {
      console.log("error total audio");
    }
  };
  // último registro
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
        reproducirAudio(ultimo);
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

  const cursosArray = Object.entries(cursos);

  return (
    <div className="tv-min-container">
      <div className="tv-min-body">

        {/* IZQUIERDA */}
        <div className="tv-min-left">

          {/* HEADER SOLO IZQUIERDA */}
          <img src={logo} alt="logo" className="d-sm-block w-50 btn" />

          {/* TABLA */}
          <table>
            <thead>
              <tr>
                <th className="col-min-curso">CURSO</th>
                <th>AULA</th>
                <th>ASIST</th>
              </tr>
            </thead>
            <tbody>
              {cursosArray.map(([key, lista], i) => {
                const [curso, aula] = key.split("||");
                const presentes = lista.filter(p => p.estado === "Presente").length;

                return (
                  <tr key={i}>  
                    <td className="col-min-curso">{curso}</td>
                    <td className="col-min-aula">{aula}</td>
                    <td className="col-min-asist">{presentes}/{lista.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                {hora.toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).toUpperCase()}
              </div>
            </div>
          </div>
        <div className="tv-min-right">
  
             {ultimoRegistro && (
            <div className="tv-min-welcome">
              <p className="tv-min-card-title">AULA {ultimoRegistro.aula}</p>
              <p className="tv-min-card-text">{ultimoRegistro.nombre.toUpperCase()}</p>
              <p className="tv-min-card-text">CURSO: {ultimoRegistro.curso}</p>
              <p className="tv-min-card-text">EMPRESA: {ultimoRegistro.empresa}</p>
            </div>
          )}
        </div>
</div>
      </div>
   
    </div>
  );
}
