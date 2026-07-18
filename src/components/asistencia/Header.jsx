// src/components/asistencia/Header.jsx

function Header({ fecha, turno }) {
  return (
    <div className="card shadow-sm mb-3">

      <div className="card-body">

        <div className="row align-items-center">

          <div className="col-md-6">

            <h3 className="mb-0 text-danger fw-bold">
              ERS CURSOS
            </h3>

            <small className="text-muted">
              Sistema de Registro de Asistencia
            </small>

          </div>

          <div className="col-md-6 text-md-end mt-3 mt-md-0">

            <div>
              <strong>📅 Fecha:</strong> {fecha}
            </div>

            <div>
              <strong>🕒 Turno:</strong> {turno}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Header;