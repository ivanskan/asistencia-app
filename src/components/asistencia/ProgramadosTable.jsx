function ProgramadosTable({ programados }) {

    return (

        <div className="card mt-3 shadow-sm">

            {/* <div className="card-header">

                <strong>
                    Programados ({programados.length})
                </strong>

            </div> */}

            <div className="table-responsive">

                <table className="table table-hover table-striped align-middle mb-0">

                    <thead className="table-dark">

                        <tr>

                            <th>DNI</th>

                            <th>Nombre</th>

                            <th>Empresa</th>

                            <th>Puesto</th>

                            <th>Curso</th>

                            <th>Aula</th>

                            <th>Estado</th>

                        </tr>

                    </thead>

                    <tbody>

                        {programados.map((item) => (

                            <tr  
                            className={
                                item.estado === "Presente"
                                ? "table-success"
                                : item.estado === "Adicional"
                                ? "table-warning"
                                : ""
                            }
                            
                            key={`${item.horario_id}-${item.dni}`} >

                                <td>{item.dni}</td>

                                <td>{item.nombre}</td>

                                <td>{item.empresa}</td>

                                <td>{item.puesto}</td>

                                <td>{item.curso}</td>

                                <td>{item.aula}</td>

                                <td>

   <span
  className={`badge ${
    item.estado === "Presente"
      ? "bg-success"
      : item.estado === "Adicional"
      ? "bg-warning"
      : item.estado === "Pendiente"
      ? "bg-secondary"
      : "bg-dark"
  }`}
>
  {item.estado}
</span>

</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default ProgramadosTable;