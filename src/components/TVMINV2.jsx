import { useEffect, useState } from "react";

import { obtenerResumen } from "../services/resumenService";
import { obtenerUltimo } from "../services/ultimoService";

function TVMINV2() {

    /*
    |--------------------------------------------------------------------------
    | Estados
    |--------------------------------------------------------------------------
    */

    const [sesion, setSesion] = useState({

        fecha: "",
        turno: ""

    });

    const [resumen, setResumen] = useState([]);

    const [ultimo, setUltimo] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Cargar resumen
    |--------------------------------------------------------------------------
    */

    async function cargarResumen() {

        try {

            const resp = await obtenerResumen();

            console.log("RESUMEN");

            console.log(resp);

            if (!resp.success) return;

            setSesion({

                fecha: resp.fecha,
                turno: resp.turno

            });

            // <-- Si tu endpoint usa otra propiedad aquí la cambiamos
            setResumen(resp.resumen ?? []);

        } catch (error) {

            console.error(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Cargar último registro
    |--------------------------------------------------------------------------
    */

    async function cargarUltimo() {

        try {

            const resp = await obtenerUltimo();

            console.log("ULTIMO");

            console.log(resp);

            if (!resp.success) return;

            // <-- Si el endpoint devuelve "ultimo" en vez de "participante"
            // simplemente cambia esta línea.
            setUltimo(resp.participante ?? null);

        } catch (error) {

            console.error(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Inicio
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        cargarResumen();

        cargarUltimo();

    }, []);

    /*
    |--------------------------------------------------------------------------
    | Vista temporal
    |--------------------------------------------------------------------------
    */

    return (

        <div className="container py-4">

            <h2>TV MIN V2</h2>

            <hr />

            <h4>Sesión</h4>

            <pre>

                {JSON.stringify(sesion, null, 2)}

            </pre>

            <hr />

            <h4>Resumen</h4>

            <pre>

                {JSON.stringify(resumen, null, 2)}

            </pre>

            <hr />

            <h4>Último registro</h4>

            <pre>

                {JSON.stringify(ultimo, null, 2)}

            </pre>

        </div>

    );

}

export default TVMINV2;