import instructores from "../data/instructores.json";

export function obtenerFotoInstructor(nombre = "") {

    const texto = nombre.toUpperCase();

    const instructor = instructores.find(item =>
        texto.includes(item.nombre.toUpperCase())
    );

    return instructor?.foto || "/instructores/default.webp";

}