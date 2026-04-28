import { useState, useEffect } from "react";
import logo from "/src/assets/ERS-logo.png";
import qrEncuesta from "/src/assets/qr-encuesta.png";

const enlacesData = {
  encuesta: "https://forms.cloud.microsoft/r/7j2v1FivSZ",

  cursos: [
    {
      nombre: "Inducción General",
      entrada: "https://forms.cloud.microsoft/r/gt7dqiKxzF",
      salida: "https://forms.cloud.microsoft/r/wzYZKkstf2"
    },
    {
      nombre: "Inducción Temporal",
      entrada: "https://forms.cloud.microsoft/r/12eLR64Qzn",
      salida: "https://forms.cloud.microsoft/r/ghW7cYsnUG"
    },
    {
      nombre: "Inducción Exploraciones",
      entrada: "https://forms.cloud.microsoft/r/jAd3W28x2c",
      salida: "https://forms.cloud.microsoft/r/berp5Cfpai"
    },
    {
      nombre: "Inducción Inglés",
      entrada: "https://forms.cloud.microsoft/r/uf81UptaAX",
      salida: "https://forms.cloud.microsoft/r/PjPZtXU6qj"
    },
    {
      nombre: "IPERC",
      entrada: "https://forms.cloud.microsoft/r/kL7FeNmCX3",
      salida: "https://forms.cloud.microsoft/r/uWY8WeYTVR"
    }
  ]
};

function Enlaces() {
  const [abierto, setAbierto] = useState(null);
  const [copiado, setCopiado] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // cargar preferencia

useEffect(() => {
  const saved = localStorage.getItem("theme");
  if (saved) {
    document.documentElement.setAttribute("data-bs-theme", saved);
    setDarkMode(saved === "dark");
  }
}, []);

const toggleDarkMode = () => {
  const nuevo = darkMode ? "light" : "dark";

  document.documentElement.setAttribute("data-bs-theme", nuevo);
  localStorage.setItem("theme", nuevo);

  setDarkMode(!darkMode);
};

  const copiar = async (texto, key) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(key);

      setTimeout(() => setCopiado(""), 1500);
    } catch (err) {
      console.error("Error copiando:", err);
    }
  };

  return (
    <div className="container py-3">
    
      <div className="col-sm-12 col-lg-8 container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src={logo} alt="logo" style={{ height: "50px" }} />
          <button className="btn btn-outline-secondary btn-sm" onClick={toggleDarkMode}>
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
        </div>

        <h4 className="my-4 fw-bold text-primary text-center">ENLACES DE FORMULARIOS </h4>

        <div className="card mb-2 shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }} onClick={() => setAbierto(abierto === "encuesta" ? null : "encuesta")}>
            <span className="fw-semibold">📊 Encuesta</span>
            <span>{abierto === "encuesta" ? "▲" : "▼"}</span>
          </div>

          {abierto === "encuesta" && (
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>🔗 Enlace</span>
                <button className="btn btn-outline-primary btn-sm" onClick={() => copiar(enlacesData.encuesta,"encuesta")}>
                  {copiado === "encuesta" ? "✔ Copiado" : "Copiar enlace"}
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span>🖼️ QR</span>
                <a href={qrEncuesta} download="qr-encuesta.png" className="btn btn-success btn-sm">
                  Descargar QR
                </a>
              </div>

            </div>
          )}
        </div>

        <div className="accordion">

          {enlacesData.cursos.map((curso, i) => (
            <div className="card mb-2 shadow-sm" key={i}>

              <div className="card-header d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }} onClick={() => setAbierto(abierto === i ? null : i)} >
                <span className="fw-semibold">{curso.nombre}</span>
                <span>{abierto === i ? "▲" : "▼"}</span>
              </div>

              {abierto === i && (
                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>🟢 Examen de Entrada</span>
                    <button className="btn btn-outline-success btn-sm" onClick={() => copiar(curso.entrada, `entrada-${i}`)} >
                      {copiado === `entrada-${i}` ? "✔ Copiado" : "Copiar enlace"}
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span>🔴 Examen de Salida</span>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => copiar(curso.salida, `salida-${i}`)}>
                      {copiado === `salida-${i}` ? "✔ Copiado" : "Copiar enlace"}
                    </button>
                  </div>

                </div>
              )}

            </div>
          ))}
          <small className="text-danger required">* Encuesta  obligatorio para todos los cursos</small>

        </div>

      </div>

    </div>
  );
}

export default Enlaces;