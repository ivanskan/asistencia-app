import { useState } from "react";
import logo from "/src/assets/ERS-logo.png";

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

      {/* HEADER */}
        <img src={logo} alt="logo" style={{ height: "50px" }} />
      <div className="d-flex align-items-center justify-content-center mb-5">
        <h4 className="ms-3 mb-0 fw-bold text-primary">
          ENLACES DE FORMULARIOS
        </h4>
      </div>

      {/* ENCUESTA */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <span className="fw-semibold">📊 Encuesta</span>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => copiar(enlacesData.encuesta, "encuesta")}
          >
            {copiado === "encuesta" ? "✔ Copiado" : "Copiar enlace"}
          </button>
        </div>
      </div>

      {/* CURSOS */}
      <div className="accordion">

        {enlacesData.cursos.map((curso, i) => (
          <div className="card mb-2 shadow-sm" key={i}>

            {/* HEADER CURSO */}
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setAbierto(abierto === i ? null : i)}
            >
              <span className="fw-semibold">{curso.nombre}</span>
              <span>{abierto === i ? "▲" : "▼"}</span>
            </div>

            {/* CONTENIDO */}
            {abierto === i && (
              <div className="card-body">

                {/* ENTRADA */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>🟢 Examen de Entrada</span>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => copiar(curso.entrada, `entrada-${i}`)}
                  >
                    {copiado === `entrada-${i}` ? "✔ Copiado" : "Copiar enlace"}
                  </button>
                </div>

                {/* SALIDA */}
                <div className="d-flex justify-content-between align-items-center">
                  <span>🔴 Examen de Salida</span>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => copiar(curso.salida, `salida-${i}`)}
                  >
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
  );
}

export default Enlaces;