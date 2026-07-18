// src/services/programadosService.js

import API from "./api";

export async function obtenerProgramados() {

    const response = await fetch(`${API}/programados.php`);

    return await response.json();

}