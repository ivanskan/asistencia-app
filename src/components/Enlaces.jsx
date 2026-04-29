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
      nombre: "Gestión de Riesgos",
      entrada: "https://forms.cloud.microsoft/r/kL7FeNmCX3",
      salida: "https://forms.cloud.microsoft/r/uWY8WeYTVR"
    },
     {
      nombre: "FRM Vehículos & Conducción y Fatiga",
      entrada: "https://forms.office.com/r/S52X2EpFDr",
      salida: "https://forms.office.com/r/LNKZWaRfvm"
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
                <span className="fw-semibold d-flex align-items-center">
                  <svg style={{"width":"15px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 576L192 576C139 576 96 533 96 480L96 160C96 107 139 64 192 64L496 64C522.5 64 544 85.5 544 112L544 400C544 420.9 530.6 438.7 512 445.3L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L480 576zM192 448C174.3 448 160 462.3 160 480C160 497.7 174.3 512 192 512L448 512L448 448L192 448zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448 325.3 448 312C448 298.7 437.3 288 424 288L248 288z"/></svg>
                   <small className="ms-1">{curso.nombre}</small>
                </span>
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