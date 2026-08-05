import { useMemo, useState } from "react";
import "./ModalAdicional.css";

function ModalAdicional({

    programados,

    onGuardar,

    onClose

}) {

    const [formulario, setFormulario] = useState({

        dni: "",
        nombre: "",
        empresa: "",
        puesto: "",
        curso: "",
        aula: "",
        horario_id: null

    });

    function cambiar(e) {

        setFormulario((anterior) => ({

            ...anterior,

            [e.target.name]: e.target.value

        }));

    }

    /*
    |--------------------------------------------------------------------------
    | Sesiones únicas
    |--------------------------------------------------------------------------
    */

    const sesiones = useMemo(() => {

        return [...new Map(

            programados.map((item) => [

                item.horario_id,

                {

                    horario_id: item.horario_id,

                    curso: item.curso,

                    aula: item.aula

                }

            ])

        ).values()];

    }, [programados]);

    /*
    |--------------------------------------------------------------------------
    | Cursos únicos
    |--------------------------------------------------------------------------
    */

    const cursos = useMemo(() => {

        return [...new Set(

            sesiones.map((s) => s.curso)

        )];

    }, [sesiones]);

    /*
    |--------------------------------------------------------------------------
    | Aulas según el curso seleccionado
    |--------------------------------------------------------------------------
    */

    const aulasCurso = useMemo(() => {

        if (!formulario.curso) return [];

        return sesiones.filter(

            (s) => s.curso === formulario.curso

        );

    }, [sesiones, formulario.curso]);


    function cambiarAula(e) {

    const aula = e.target.value;

    const sesion = aulasCurso.find(

        (item) => item.aula === aula

    );

    setFormulario((anterior) => ({

        ...anterior,

        aula,

        horario_id: sesion ? sesion.horario_id : null

    }));

}

function limpiarFormulario() {

    setFormulario({

        dni: "",
        nombre: "",
        empresa: "",
        puesto: "",
        curso: "",
        aula: "",
        horario_id: null

    });

}

async function guardar() {

    const resp = await onGuardar(formulario);

    if (!resp.success) return;

    limpiarFormulario();

}


    return (

        <div
    className="modal-overlay p-5"
    onClick={onClose}
>

    <div
        className="modal-window"
        onClick={(e) => e.stopPropagation()}
    >

            <div className="modal-dialog modal-lg">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5 className="modal-title mb-3">

                            Registrar participante adicional

                        </h5>

                    </div>
                
                    <div className="modal-body">

                        <div className="row g-3">

                            <div className="col-md-4">

                                <label className="form-label">

                                    DNI

                                </label>

                                <input
                                    className="form-control"
                                    name="dni"
                                    value={formulario.dni}
                                    onChange={cambiar}
                                />

                            </div>

                            <div className="col-md-8">

                                <label className="form-label">

                                    Apellidos y nombres

                                </label>

                                <input
                                    className="form-control"
                                    name="nombre"
                                    value={formulario.nombre}
                                    onChange={cambiar}
                                />

                            </div>

                            <div className="col-md-6">

                                <label className="form-label">

                                    Empresa

                                </label>

                                <input
                                    className="form-control"
                                    name="empresa"
                                    value={formulario.empresa}
                                    onChange={cambiar}
                                />

                            </div>

                            <div className="col-md-6">

                                <label className="form-label">

                                    Puesto (Opcional)

                                </label>

                                <input
                                    className="form-control"
                                    name="puesto"
                                    value={formulario.puesto}
                                    onChange={cambiar}
                                />

                            </div>

                            <div className="col-md-6">

                                <label className="form-label">

                                    Curso

                                </label>

                                <select
                                    className="form-select"
                                    name="curso"
                                    value={formulario.curso}
                                    onChange={cambiar}
                                >

                                    <option value="">

                                        Seleccione...

                                    </option>

                                    {cursos.map((curso) => (

                                        <option
                                            key={curso}
                                            value={curso}
                                        >

                                            {curso}

                                        </option>

                                    ))}

                                </select>

                            </div>

                            <div className="col-md-6">

                                <label className="form-label">

                                    Aula

                                </label>

                                <select
                                    className="form-select"
                                    name="aula"
                                    value={formulario.aula}
                                    onChange={cambiarAula}
                                >

                                

                                    <option value="">

                                        Seleccione...

                                    </option>

                                    {aulasCurso.map((item) => (

                                        <option
                                            key={item.horario_id}
                                            value={item.aula}
                                        >

                                            {item.aula}

                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>

                    </div>

                    <div className="modal-footer mt-3">

                     <button

    className="btn btn-secondary"

    onClick={onClose}

>

    Cancelar

</button>

                        <button
                            type="button"
                            className="btn btn-primary"

                            onClick={guardar}
                        >

                            Registrar

                        </button>

                    </div>

                </div>

            </div>

        </div>

        </div>


    );

}

export default ModalAdicional;