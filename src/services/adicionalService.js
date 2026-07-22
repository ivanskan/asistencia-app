import API from "./api";

export async function registrarAdicional(datos) {

    const response = await fetch(`${API}/adicional.php`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(datos)

    });

    return await response.json();

}