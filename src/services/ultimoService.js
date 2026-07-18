// src/services/ultimoService.js

import API from "./api";

export async function obtenerUltimo() {

    const response = await fetch(`${API}/ultimo.php`);

    return await response.json();

}