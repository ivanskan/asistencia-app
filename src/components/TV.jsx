import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function TV() {
  const [programados, setProgramados] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [indice, setIndice] = useState(0);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [hora, setHora] = useState(new Date());
  const [tiempoToast, setTiempoToast] = useState(null);

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

  // 🔥 asistencia
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "asistencia"), (snapshot) => {
      setAsistencia(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  // 🔊 audio
  const reproducirAudio = (persona) => {
    const texto = `Bienvenido ${persona.nombre}, curso ${persona.curso}, aula ${persona.aula}`;
    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = "es-ES";
    speech.rate = 0.9;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // 🔥 último registro
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
        setTiempoToast(Date.now());
        reproducirAudio(ultimo);
      }
    });

    return () => unsub();
  }, []);

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
    }, 6000);

    return () => clearInterval(interval);
  }, [cursosArray.length]);

  const formatoNombre = (texto) => {
    if (!texto) return "";

    texto = String(texto);
    const minusculas = ["de", "la", "los", "las", "y", "del", "en", "a"];
    return texto
      .toLowerCase()
      .split(" ")
      .map((palabra, i) => {
        if (i !== 0 && minusculas.includes(palabra)) {
          return palabra;
        }
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      })
      .join(" ");
  };

  useEffect(() => {
  if (!ultimoRegistro || !tiempoToast) return;

  const interval = setInterval(() => {
    const ahora = Date.now();

    if (ahora - tiempoToast > 6000) {
      setUltimoRegistro(null);
      setTiempoToast(null);
    }
  }, 500); // revisa cada 0.5s

  return () => clearInterval(interval);
}, [ultimoRegistro, tiempoToast]);

  useEffect(() => {
  const unlockAudio = () => {
    try {
      if ("speechSynthesis" in window) {
        const dummy = new SpeechSynthesisUtterance(" ");
        window.speechSynthesis.speak(dummy);
        window.speechSynthesis.cancel();
        console.log("🔓 Audio desbloqueado");
      }
    } catch (e) {
      console.log("Error desbloqueando audio", e);
    }
  };

  // 👇 IMPORTANTE: en TV el keydown es clave
  document.addEventListener("keydown", unlockAudio, { once: true });
  document.addEventListener("click", unlockAudio, { once: true });

  return () => {
    document.removeEventListener("keydown", unlockAudio);
    document.removeEventListener("click", unlockAudio);
  };
}, []);

  return (
    <div className="tv-container">
      <div className="tv-body">

        {/* IZQUIERDA */}
        <div className="tv-left">

          {/* HEADER SOLO IZQUIERDA */}
          <div className="tv-left-header">
            <div className="tv-title">ASISTENCIA</div>

            <div className="tv-clock">
              <div className="tv-clock-time">
                {hora.toLocaleTimeString()}
              </div>
              <div className="tv-clock-date">
                {hora.toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* TABLA */}
          <table>
            <thead>
              <tr>
                <th className="col-curso">CURSO</th>
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
                  <tr key={i} className={activo ? "tv-active" : ""}>
                    <td className="col-curso">{formatoNombre(curso)}</td>
                    <td className="col-aula">{formatoNombre(aula)}</td>
                    <td className="col-asist">{presentes}/{lista.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* DERECHA */}
        <div className="tv-right">
          {cursoActivo && (
            <>
              <div className="tv-curso-title">
                {cursoActivo[0].replace("||", " - ")}
              </div>

              <table className="tv-table">
                <thead>
                  <tr>
                    <th className="col-dni">DNI</th>
                    <th className="col-nombre">NOMBRE</th>
                    <th className="col-empresa">EMPRESA</th>
                    <th className="col-check">ASIST</th>
                  </tr>
                </thead>
                <tbody>
                  {cursoActivo[1]
                    .sort((a, b) =>
                      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
                    )
                    .map((p, i) => (
                      <tr key={i}>
                        <td className="col-dni">{p.dni}</td>
                        <td className="col-nombre">{formatoNombre(p.nombre)}</td>
                        <td className="col-empresa">{formatoNombre(p.empresa)}</td>
                        <td className={`col-check ${formatoNombre(p.estado) == "Presente" ? "ok" : "bad"}`}>
                          {p.estado === "Presente" ? "Presente" : "Falta"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
        </div>

      </div>

      {/* TOAST */}
      {ultimoRegistro && (
        <div className="tv-welcome">
          <div>👋 BIENVENIDO</div>
          <div>{formatoNombre(ultimoRegistro.nombre)}</div>
          <div>{formatoNombre(ultimoRegistro.curso)}</div>
          <div>Aula: {formatoNombre(ultimoRegistro.aula)}</div>
        </div>
      )}
    </div>
  );
}
