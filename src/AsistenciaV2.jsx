import { useEffect, useState } from "react";

import { registrarAsistencia } from "./services/asistenciaService";
import { obtenerProgramados } from "./services/programadosService";

import Header from "./components/asistencia/Header";
import RegistroPanel from "./components/asistencia/RegistroPanel";
import UltimoRegistroCard from "./components/asistencia/UltimoRegistroCard";


function AsistenciaV2() {

   const [programados, setProgramados] = useState([]);

    const [filtrados, setFiltrados] = useState([]);

    const [participante, setParticipante] = useState(null);

    const [mensaje, setMensaje] = useState({
        tipo: "",
        texto: ""
    });

    const [filtros, setFiltros] = useState({
        buscar: "",
        curso: "",
        empresa: "",
        aula: ""
    });

const registrar = async (dni) => {

    try {

        const resp = await registrarAsistencia(dni);

        setMensaje({
            tipo: resp.success ? "success" : "danger",
            texto: resp.message
        });

        if (resp.success) {

            setParticipante(resp.participante);

        } else {

            setParticipante(null);

        }

        console.log(resp);

    } catch (error) {

        console.error(error);

    }

};

useEffect(() => {

    cargarProgramados();

}, []);

async function cargarProgramados() {

    try {

        const resp = await obtenerProgramados();

        console.log(resp);

        if (resp.success) {

            setProgramados(resp.programados);

            setFiltrados(resp.programados);

        }

    } catch (error) {

        console.error(error);

    }

}
    return (

        <div className="container-fluid py-3">

            <Header

                fecha="17/07/2026"

                turno="Mañana"

            />

            <RegistroPanel

                onRegistrar={registrar}

            />

            {participante && (

    <UltimoRegistroCard

    participante={participante}

/>

)}

<hr />

<h5>Programados</h5>

<pre className="bg-light p-3 rounded">

    {JSON.stringify(filtrados, null, 2)}

</pre>

        </div>

    );

}

export default AsistenciaV2;