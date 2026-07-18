// src/services/resumenService.js

import API from "./api";

export async function obtenerResumen() {

    const response = await fetch(`${API}/resumen.php`);

    return await response.json();

}