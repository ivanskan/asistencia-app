function FiltrosPanel({

    filtros,

    setFiltros,

    programados

}) {

    const cursos = [...new Set(

        programados.map(p => p.curso)

    )].sort();

    const empresas = [...new Set(

        programados.map(p => p.empresa)

    )].sort();

    const aulas = [...new Set(

        programados.map(p => p.aula)

    )].sort();

    function cambiar(e) {

        setFiltros({

            ...filtros,

            [e.target.name]: e.target.value

        });

    }

    return (

        <div className="card mt-3 shadow-sm">

            <div className="card-body">

                <div className="row g-2">

                    <div className="col-md-3">

                        <input

                            className="form-control"

                            placeholder="Buscar..."

                            name="buscar"

                            value={filtros.buscar}

                            onChange={cambiar}

                        />

                    </div>

                    <div className="col-md-2">

                        <select

                            className="form-select"

                            name="curso"

                            value={filtros.curso}

                            onChange={cambiar}

                        >

                            <option value="">

                                Todos los cursos

                            </option>

                            {cursos.map(curso => (

                                <option

                                    key={curso}

                                    value={curso}

                                >

                                    {curso}

                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="col-md-3">

                        <select

                            className="form-select"

                            name="empresa"

                            value={filtros.empresa}

                            onChange={cambiar}

                        >

                            <option value="">

                                Todas las empresas

                            </option>

                            {empresas.map(emp => (

                                <option

                                    key={emp}

                                    value={emp}

                                >

                                    {emp}

                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="col-md-2">

                        <select

                            className="form-select"

                            name="aula"

                            value={filtros.aula}

                            onChange={cambiar}

                        >

                            <option value="">

                                Todas las aulas

                            </option>

                            {aulas.map(aula => (

                                <option

                                    key={aula}

                                    value={aula}

                                >

                                    {aula}

                                </option>

                            ))}

                        </select>

                    </div>
                    <div className="col-md-2 d-grid">

    <button
        className="btn btn-outline-secondary"
        onClick={() =>
            setFiltros({
                buscar: "",
                curso: "",
                empresa: "",
                aula: ""
            })
        }
    >
        Limpiar
    </button>

</div>

                </div>

            </div>

        </div>

    );

}

export default FiltrosPanel;