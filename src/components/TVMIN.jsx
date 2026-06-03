import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where
} from "firebase/firestore";
import "./TVMIN.css";
import logo from "/src/assets/ERS-logo.png";
import eresito from "/src/assets/ersito.png";

export default function TVMIN() {
  const [programados, setProgramados] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("ok");
  const [hora, setHora] = useState(new Date());
  const [animKey, setAnimKey] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [colaMensajes, setColaMensajes] = useState([]);
  const [mensajeActivo, setMensajeActivo] = useState(null);
  const procesando = useRef(false);
  const [modoIdle, setModoIdle] = useState(true);
  const idleTimer = useRef(null);

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
  const fechaHoy = getFechaHoy();
  const turnoActual = getTurnoActual();

  const q = query(
    collection(db, "programados"),
    where("fecha", "==", fechaHoy),
    where("turno", "==", turnoActual)
  );

  const unsub = onSnapshot(q, (snapshot) => {
    setProgramados(snapshot.docs.map(doc => doc.data()));
  });

  return () => unsub();
}, []);

  // asistencia
useEffect(() => {
  const fechaHoy = getFechaHoy();
  const turnoActual = getTurnoActual();

  const q = query(
    collection(db, "asistencia"),
    where("fecha", "==", fechaHoy),
    where("turno", "==", turnoActual)
  );

  const unsub = onSnapshot(q, (snapshot) => {
    setAsistencia(snapshot.docs.map(doc => doc.data()));
  });

  return () => unsub();
}, []);

  // 🔊 audio
const audios = {
  ok: new Audio("/audio/bienvenido.mp3"),
  warning: new Audio("/audio/registrado.mp3"),
  error: new Audio("/audio/error.mp3"),
  additional: new Audio("/audio/bienvenido.mp3"),
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

      const tipo = (ultimo.tipo || "ok").trim().toLowerCase();

      let payload;

      if (typeof ultimo.data === "object") {
        payload = {
          tipo,
          ...ultimo.data
        };
      } else {
        payload = {
          tipo,
          nombre: ultimo.data || "",
          aula: "",
          curso: "",
          empresa: ""
        };
      }

      // 👉 AGREGA A LA COLA (NO REEMPLAZA)
      setColaMensajes(prev => [...prev, payload]);
    }
  });

  return () => unsub();
}, []);

// QUEUE

useEffect(() => {
  if (procesando.current) return;
  if (colaMensajes.length === 0) return;

  procesando.current = true;

  const mensaje = colaMensajes[0];

  setMensajeActivo(mensaje);
  setTipoMensaje(mensaje.tipo);
  setAnimKey(prev => prev + 1);

  // ✨ sparkle solo en OK
  if (mensaje.tipo === "ok" || mensaje.tipo === "additional") {
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 1200);
  }

  reproducirAudio(mensaje.tipo);

  // ⏳ duración en pantalla
  setTimeout(() => {
    setColaMensajes(prev => prev.slice(1)); // quita el primero
    procesando.current = false;
  }, 3500);

}, [colaMensajes]);

  // agrupar cursos
  const cursos = {};

  programados.forEach(p => {
    const key = `${p.curso}||${p.aula || "SIN AULA"}`;
    if (!cursos[key]) cursos[key] = [];

    const presente = asistencia.find(a => a.dni === p.dni);

    cursos[key].push({
      ...p,
      estado: presente ? "Presente" : "Falta",
       instructorFoto: p.instructorFoto,
       instructorNombre: p.instructorNombre
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

useEffect(() => {
  if (colaMensajes.length === 0) return;

  // 👇 hubo actividad → salir de idle
  setModoIdle(false);

  // limpiar timer anterior
  if (idleTimer.current) clearTimeout(idleTimer.current);

  // 👇 iniciar conteo de 2 minutos
  idleTimer.current = setTimeout(() => {
    setModoIdle(true);
  }, 1 * 60 * 1000);

}, [colaMensajes]);

useEffect(() => {
  setModoIdle(true);
}, []);


const getTurnoActual = () => {
  const hora = new Date().getHours();

  if (hora < 13) return "mañana";
  return "tarde";
};

const getFechaHoy = () => {
  const hoy = new Date();

  const year = hoy.getFullYear();
  const month = (hoy.getMonth() + 1).toString().padStart(2, "0");
  const day = hoy.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`; // 👈 ESTO ES CLAVE
};

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
      <th>FOTO</th>
      <th>INSTRUCTOR</th>
      <th className="col-min-curso">CURSO</th>
      <th className="text-end">AULA</th>
      <th className="text-end ps-2">ASIST</th>
    </tr>
  </thead>

  <tbody>
    {cursosArray.map(([key, lista], i) => {
      const [curso, aula] = key.split("||");

      const presentes = lista.filter(
        (p) => p.estado === "Presente" || p.estado === "Adicional"
      ).length;

      // 👇 tomamos el primero como referencia
      const instructorFoto = lista[0]?.instructorFoto;
      const instructorNombre = lista[0]?.instructorNombre;

      return (
        <tr key={i}>
          {/* FOTO */}
          <td className="col-min-foto">
            {instructorFoto ? (
              <img
                src={instructorFoto}
                alt={instructorNombre}
                className="img-instructor"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="img-placeholder">👤</div>
            )}
          </td>

          {/* NOMBRE INSTRUCTOR */}
          <td className="col-min-curso">
            {instructorNombre || "SIN INSTRUCTOR"}
          </td>

          {/* CURSO */}
          <td className="col-min-curso">{curso}</td>

          {/* AULA */}
          <td className="col-min-aula text-end">{aula}</td>

          {/* ASISTENCIA */}
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

  {modoIdle ? (
    <div className="tv-idle">
      <img src={eresito} alt="idle" className="idle-img" />
    </div>
  ) : (
    <>
      {showSparkle && (
        <div className="sparkle-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="sparkle"></span>
          ))}
        </div>
      )}

{mensajeActivo && (
  <div
    key={animKey}
    className={`tv-min-welcome ${
      mensajeActivo.tipo === "additional"
        ? "tv-adicional"
        : mensajeActivo.tipo === "ok"
        ? "tv-ok"
        : mensajeActivo.tipo === "warning"
        ? "tv-warning"
        : "tv-error"
    }`}
  >
    <p className="tv-min-aula">
      {mensajeActivo.tipo === "error"
        ? "❌ No encontrado!"
        : `AULA ${mensajeActivo.aula || ""}`}
    </p>

    {/* 🔴 ERROR → SOLO DNI */}
    {mensajeActivo.tipo === "error" ? (
      <div className="tv-min-grid">
        <span className="label">DNI</span>
        <span className="value">{mensajeActivo.dni}</span>
      </div>
    ) : (
      /* 🟢 NORMAL */
      <div className="tv-min-grid">
        <span className="label">NOMBRE</span>
        <span className="value">
          {(mensajeActivo.nombre || "").toUpperCase()}
        </span>

        <span className="label">CURSO</span>
        <span className="value">
          {mensajeActivo.curso || ""}
        </span>

        <span className="label">EMPRESA</span>
        <span className="value">
          {mensajeActivo.empresa || ""}
        </span>
      </div>
    )}
  </div>
)}
    </>
  )}

</div>
          <div className="tv-min-queue">
  {colaMensajes.slice(1, 4).map((m, i) => (
    <div key={i} 
   className={`queue-item queue-${m.tipo}`}>
      {(m.nombre || "").toUpperCase()}
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  );
}
