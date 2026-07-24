import { useEffect, useState, useMemo, useRef } from "react";

import { obtenerResumen } from "../services/resumenService";
import { obtenerUltimo } from "../services/ultimoService";

import "./TVMIN.css";
import logo from "/src/assets/ERS-logo.png";

function TVMINV2() {

    

    const [hora, setHora] = useState(new Date());
    
    const [resumen, setResumen] = useState([]);

    const [ultimo, setUltimo] = useState(null);

    const [sesion, setSesion] = useState({

        fecha: "",
        turno: ""

    });

    const ultimoId = useRef(0);
    const sonidos = useRef({});

useEffect(() => {

    const timer = setInterval(() => {

        setHora(new Date());

    }, 1000);

    return () => clearInterval(timer);

}, []);




    /*
    |--------------------------------------------------------------------------
    | Cargar resumen
    |--------------------------------------------------------------------------
    */

   async function cargarResumen() {

    try {

        const resp = await obtenerResumen();

        if (!resp.success) return;

        setSesion({

            fecha: resp.data.fecha,
            turno: resp.data.turno

        });

        setResumen(resp.data);

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

        if (!resp.success) return;

        // Es el mismo registro
        if (resp.id === ultimoId.current) {

            return;

        }

        // Nuevo registro
        ultimoId.current = resp.id;

        setUltimo(resp);

        await cargarResumen();

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

    useEffect(() => {

    const intervaloResumen = setInterval(() => {

        cargarResumen();

    }, 30000);

    const intervaloUltimo = setInterval(() => {

        cargarUltimo();

    }, 1000);

    return () => {

        clearInterval(intervaloResumen);

        clearInterval(intervaloUltimo);

    };

}, []);


useEffect(() => {

    sonidos.current = {

        success: new Audio("/audio/success.mp3"),

        warning: new Audio("/audio/warning.mp3"),

        danger: new Audio("/audio/error.mp3")

    };

}, []);


  return (

    <div className="tv-min-container">

        <div className="tv-min-body">

            {/* ==========================
                IZQUIERDA
            ========================== */}

            <div className="tv-min-left">

                <div className="d-flex align-items-center">

                    <img
                        src={logo}
                        alt="logo"
                        className="d-sm-block w-50"
                    />

                </div>

                <table>

                    <thead>

                        <tr>

                            <th>FOTO</th>
                            <th>INSTRUCTOR</th>
                            <th className="col-min-curso">CURSO</th>
                            <th className="text-end">AULA</th>
                            <th className="text-end ps-2">ASIST</th>

                        </tr>

                    </thead>

                    <tbody>

                        {resumen.cursos?.map((item, i) => (

                            <tr key={i}>

                                <td className="col-min-foto">

                                    <div className="img-placeholder">

                                        👤

                                    </div>

                                </td>

                                <td>

                                    {item.instructor}

                                </td>

                                <td className="col-min-curso">

                                    {item.curso}

                                </td>

                                <td className="text-end">

                                    {item.aula}

                                </td>

                                <td className="text-end">

                                     {item.registrados}/{item.programados}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

                <div className="table-foot mt-2">

                    <span className="sumary">

                        TOTAL

                    </span>

                    <span className="col-min-caption">

                        {resumen.total_registrados}/
                        {resumen.total_participantes}

                    </span>

                </div>

            </div>

            {/* ==========================
                DERECHA
            ========================== */}

            <div>

                <div className="tv-min-left-header">

                    <div className="tv-min-title">

                        ASISTENCIA

                    </div>

                    <div className="tv-min-clock">

                        <div className="tv-min-clock-time">

                            {hora.toLocaleTimeString()}

                        </div>

                        <div className="tv-min-clock-date">

                            {hora
                                .toLocaleDateString("es-PE", {

                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"

                                })
                                .toUpperCase()}

                        </div>

                    </div>

                </div>

                <div className="tv-min-right">

                    {ultimo && (

                        <div className="tv-min-welcome tv-ok">

                            <p className="tv-min-aula">

                                AULA {ultimo.aula}

                            </p>

                            <div className="tv-min-grid">

                                <span className="label">

                                    NOMBRE

                                </span>

                                <span className="value">

                                    {ultimo.nombre?.toUpperCase()}

                                </span>

                                <span className="label">

                                    CURSO

                                </span>

                                <span className="value">

                                    {ultimo.curso}

                                </span>

                                <span className="label">

                                    EMPRESA

                                </span>

                                <span className="value">

                                    {ultimo.empresa}

                                </span>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>

    </div>

);

}

export default TVMINV2;