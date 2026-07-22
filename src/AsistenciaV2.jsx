import { useEffect, useState, useMemo } from "react";

import { registrarAsistencia } from "./services/asistenciaService";
import { obtenerProgramados } from "./services/programadosService";
import { registrarAdicional as registrarAdicionalService } from "./services/adicionalService";

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

    const [sesion, setSesion] = useState({

    fecha: "",

    turno: ""

});

    /*
    |--------------------------------------------------------------------------
    | Estados
    |--------------------------------------------------------------------------
    */

    const [programados, setProgramados] = useState([]);

    // const [participante, setParticipante] = useState(null);
    const [resultadoRegistro, setResultadoRegistro] = useState(null);

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

    const [mostrarModal, setMostrarModal] = useState(false);

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

            setSesion({

                fecha: resp.fecha,

                turno: resp.turno

            });

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

        } catch (error) {

            console.error(error);

        }

    }

    /*
|--------------------------------------------------------------------------
| Mostrar resultado del registro
|--------------------------------------------------------------------------
*/

function mostrarResultado(resp) {

    setMensaje({

        tipo: resp.status,

        texto: resp.message

    });

    setResultadoRegistro({

        tipo: resp.status,

        mensaje: resp.message,

        participante: resp.participante ?? null

    });

}


const registrar = async (dni) => {

    try {

        const resp = await registrarAsistencia(dni);

        mostrarResultado(resp);

        if (resp.success) {

            setProgramados((anterior) =>

                actualizarEstadoParticipante(

                    anterior,

                    resp.participante,

                    ESTADOS.PRESENTE

                )

            );

        }

    } catch (error) {

        console.error(error);

        mostrarResultado({

            status: "danger",

            message: "Error al conectar con el servidor.",

            participante: null

        });

    }

};

    /*
    |--------------------------------------------------------------------------
    | Actualizar estado participante
    |--------------------------------------------------------------------------
    */

function actualizarEstadoParticipante(lista, participante, estado) {

    return lista.map((item) => {

        const coincide =
            String(item.dni) === String(participante.dni) &&
            Number(item.horario_id) === Number(participante.horario_id);

        if (coincide) {

            return {

                ...item,

                estado

            };

        }

        return item;

    });

}


const registrarAdicional = async (datos) => {

    try {

        const resp = await registrarAdicionalService(datos);

        mostrarResultado(resp);

        if (!resp.success) {

            return resp;

        }

        await cargarProgramados();

        setMostrarModal(false);

        return resp;

    } catch (error) {

        console.error(error);

        mostrarResultado({

            status: "danger",

            message: "Error al registrar el participante.",

            participante: null

        });

        return {

            success: false,

            status: "danger",

            message: "Error al registrar."

        };

    }

};
return (

        <div className="container-fluid py-3">

            <Header
              

                    fecha={sesion.fecha}

                    turno={sesion.turno}


            />

            <RegistroPanel
                onRegistrar={registrar}
            />
            <div className="mt-3">

        <button
            className="btn btn-outline-primary"
            onClick={() => setMostrarModal(true)}
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

           {resultadoRegistro && (

    <UltimoRegistroCard

        resultado={resultadoRegistro}

    />

)}

            <ProgramadosTable
                programados={programadosFiltrados}
            />
{mostrarModal && (

    <ModalAdicional

        programados={programados}

        onGuardar={registrarAdicional}

        onClose={() => setMostrarModal(false)}

    />

)}

        </div>

    );

}

export default AsistenciaV2;