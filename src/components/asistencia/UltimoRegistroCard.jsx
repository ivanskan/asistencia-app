function UltimoRegistroCard({ participante }) {

    if (!participante) return null;

    return (

        <div className="card border-success shadow-sm mt-4">

            <div className="card-header bg-success text-white">

                ✅ Asistencia registrada

            </div>

            <div className="card-body">

                <h4 className="mb-3">

                    {participante.nombre}

                </h4>

                <p className="mb-1">
                    <strong>DNI:</strong> {participante.dni}
                </p>

                <p className="mb-1">
                    <strong>Empresa:</strong> {participante.empresa}
                </p>

                <p className="mb-1">
                    <strong>Curso:</strong> {participante.curso}
                </p>

                <p className="mb-1">
                    <strong>Aula:</strong> {participante.aula}
                </p>

                <p className="mb-0">
                    <strong>Hora:</strong> {participante.hora_registro}
                </p>

            </div>

        </div>

    );

}

export default UltimoRegistroCard;