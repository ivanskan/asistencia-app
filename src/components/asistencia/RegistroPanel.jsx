// components/asistencia/RegistroPanel.jsx

import { useState } from "react";

function RegistroPanel({ onRegistrar }) {

    const [dni, setDni] = useState("");

    const registrar = () => {

        const valor = dni.trim();

        if (!valor) return;

        onRegistrar(valor);

        setDni("");

    };

    const handleKeyDown = (e) => {

        if (e.key === "Enter") {
            registrar();
        }

    };

    return (

        <div className="card shadow-sm mb-3">

            <div className="card-body">

                <h5 className="card-title mb-3">
                    Registro de asistencia
                </h5>

                <div className="row g-2">

                    <div className="col-md-9">

                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Ingrese o escanee el DNI"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />

                    </div>

                    <div className="col-md-3 d-grid">

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={registrar}
                        >
                            Registrar
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default RegistroPanel;