// src/services/asistenciaService.js

import API from "./api";

export async function registrarAsistencia(dni) {

    const response = await fetch(`${API}/asistencia.php`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            dni
        })

    });

    return await response.json();

}