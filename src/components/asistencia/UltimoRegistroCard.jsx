function UltimoRegistroCard({ resultado }) {

    const participante = resultado?.participante;

const estilos = {

    success: {

        card: "border-success bg-success-subtle",

        badge: "bg-success",

        titulo: "REGISTRO EXITOSO",

        icono: "✅"

    },

    warning: {

        card: "border-warning bg-warning-subtle",

        badge: "bg-warning text-dark",

        titulo: "YA REGISTRADO",

        icono: "⚠️"

    },

    danger: {

        card: "border-danger bg-danger-subtle",

        badge: "bg-danger",

        titulo: "NO ENCONTRADO",

        icono: "❌"

    }

};

const estilo = estilos[resultado.tipo] || estilos.success;

    if (!participante) return null;

   return (

    <div className={`card mt-3 shadow-sm border-2 ${estilo.card}`}>

        <div className={`card-header d-flex justify-content-between align-items-center ${estilo.badge}`}>

            <span>

                {estilo.icono} {estilo.titulo}

            </span>

        </div>

        <div className="card-body">

            <p className="text-muted mb-3">

                {resultado.mensaje}

            </p>

            {participante?.nombre && (

                <h4 className="mb-3">

                    {participante.nombre}

                </h4>

            )}

            <p className="mb-1">

                <strong>DNI:</strong>{" "}

                {participante?.dni ?? "-"}

            </p>

            {participante?.empresa && (

                <p className="mb-1">

                    <strong>Empresa:</strong>{" "}

                    {participante.empresa}

                </p>

            )}

            {participante?.curso && (

                <p className="mb-1">

                    <strong>Curso:</strong>{" "}

                    {participante.curso}

                </p>

            )}

            {participante?.aula && (

                <p className="mb-1">

                    <strong>Aula:</strong>{" "}

                    {participante.aula}

                </p>

            )}

            {participante?.hora_registro && (

                <p className="mb-0">

                    <strong>Hora:</strong>{" "}

                    {participante.hora_registro}

                </p>

            )}

        </div>

    </div>

);

}

export default UltimoRegistroCard;