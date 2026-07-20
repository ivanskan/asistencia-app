import { useEffect, useState, useMemo } from "react";

import { registrarAsistencia } from "./services/asistenciaService";
import { obtenerProgramados } from "./services/programadosService";

import Header from "./components/asistencia/Header";
import RegistroPanel from "./components/asistencia/RegistroPanel";
import UltimoRegistroCard from "./components/asistencia/UltimoRegistroCard";
import ProgramadosTable from "./components/asistencia/ProgramadosTable";
import ResumenCards from "./components/asistencia/ResumenCards";
import FiltrosPanel from "./components/asistencia/FiltrosPanel";
import ModalAdicional from "./components/asistencia/ModalAdicional";

const ESTADOS = {
    PENDIENTE: "Pendiente",
    PRESENTE: "Presente",
    ADICIONAL: "Adicional"
};

function AsistenciaV2() {

    /*
    |--------------------------------------------------------------------------
    | Estados
    |--------------------------------------------------------------------------
    */

    const [programados, setProgramados] = useState([]);

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

    const programadosFiltrados = useMemo(() => {

    return programados.filter((item) => {

        const buscar = filtros.buscar.trim().toLowerCase();

        const coincideTexto =
            buscar === "" ||

            item.nombre.toLowerCase().includes(buscar) ||

            item.dni.includes(buscar);

        const coincideCurso =
            filtros.curso === "" ||
            item.curso === filtros.curso;

        const coincideEmpresa =
            filtros.empresa === "" ||
            item.empresa === filtros.empresa;

        const coincideAula =
            filtros.aula === "" ||
            item.aula === filtros.aula;

        return (
            coincideTexto &&
            coincideCurso &&
            coincideEmpresa &&
            coincideAula
        );

    });

}, [programados, filtros]);

    /*
    |--------------------------------------------------------------------------
    | Cargar programados
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        cargarProgramados();

    }, []);

    async function cargarProgramados() {

        try {

            const resp = await obtenerProgramados();

            // console.log(resp);

            if (!resp.success) return;

            const lista = resp.programados.flatMap((sesion) =>

                sesion.participantes.map((participante) => ({

                    horario_id: sesion.horario_id,
                    sesion_id: sesion.sesion_id,

                    curso: sesion.curso,
                    instructor: sesion.instructor,
                    aula: sesion.aula,

                    fecha: sesion.fecha,
                    turno: sesion.turno,

                    hora_inicio: sesion.hora_inicio,
                    hora_fin: sesion.hora_fin,

                    total_participantes: sesion.total_participantes,
                    registrados: sesion.registrados,

                    dni: participante.dni,
                    nombre: participante.nombre,
                    empresa: participante.empresa,
                    puesto: participante.puesto,
                    area: participante.area,

                    estado: participante.estado

                }))

            );

            setProgramados(lista);
            console.log(lista.find(p => p.dni === "70214751"));

        } catch (error) {

            console.error(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Registrar asistencia
    |--------------------------------------------------------------------------
    */

    async function registrar(dni) {

        try {

            const resp = await registrarAsistencia(dni);

            // console.log(resp);

            setMensaje({
                tipo: resp.success ? "success" : "danger",
                texto: resp.message
            });

            if (resp.success) {

                setParticipante(resp.participante);

    setProgramados((anterior) => {

    const nuevaLista = anterior.map((item) => {

        if (
            String(item.dni) === String(resp.participante.dni) &&
            Number(item.horario_id) === Number(resp.participante.horario_id)
        ) {

            console.log("✅ CAMBIANDO ESTADO");

            return {
                ...item,
                estado: ESTADOS.PRESENTE
            };
        }

        return item;

    });

    console.table(nuevaLista);

    return nuevaLista;

});
            } else {

                setParticipante(null);

            }

        } catch (error) {

            console.error(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Actualizar estado participante
    |--------------------------------------------------------------------------
    */

 function actualizarEstadoParticipante(lista, participante, estado) {

    // console.log("Participante recibido:", participante);

    return lista.map((item) => {

        const coincide =
            String(item.dni) === String(participante.dni) &&
            Number(item.horario_id) === Number(participante.horario_id);

        console.log({
            tabla_dni: item.dni,
            api_dni: participante.dni,
            tabla_horario: item.horario_id,
            api_horario: participante.horario_id,
            coincide
        });

        if (coincide) {

            console.log("✅ ACTUALIZADO");

            return {
                ...item,
                estado
            };

        }

        return item;

    });

}
    /*
    |--------------------------------------------------------------------------
    | Debug (temporal)
    |--------------------------------------------------------------------------
    */

    // useEffect(() => {

    //     console.table(programados);

    // }, [programados]);

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <div className="container-fluid py-3">

            <Header
                fecha="17/07/2026"
                turno="Mañana"
            />

            <RegistroPanel
                onRegistrar={registrar}
            />
            <div className="mt-3">

    <button

        className="btn btn-outline-primary"

        data-bs-toggle="modal"

        data-bs-target="#modalAdicional"

    >

        + Registrar participante adicional

    </button>

</div>

            <ResumenCards

    programados={programadosFiltrados}

/>


<FiltrosPanel

    filtros={filtros}

    setFiltros={setFiltros}

    programados={programadosFiltrados}

/>

            {participante && (

                <UltimoRegistroCard
                    participante={participante}
                />

            )}

            <ProgramadosTable
                programados={programadosFiltrados}
            />

            <ModalAdicional />

        </div>

    );

}

export default AsistenciaV2;