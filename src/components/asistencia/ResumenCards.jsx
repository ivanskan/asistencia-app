function ResumenCards({ programados }) {

    const total = programados.length;

    const presentes = programados.filter(
        p => p.estado === "Presente"
    ).length;

    const adicionales = programados.filter(
        p => p.estado === "Adicional"
    ).length;

    const pendientes = total - presentes - adicionales;

    const cards = [

        {
            titulo: "Programados",
            valor: total,
            color: "primary"
        },

        {
            titulo: "Presentes",
            valor: presentes,
            color: "success"
        },

        {
            titulo: "Pendientes",
            valor: pendientes,
            color: "warning"
        },

        {
            titulo: "Adicionales",
            valor: adicionales,
            color: "secondary"
        }

    ];

    return (

        <div className="row g-3 mt-2">

            {cards.map((card) => (

                <div
                    className="col-6 col-md-3"
                    key={card.titulo}
                >

                    <div className={`card border-${card.color} shadow-sm`}>

                        <div className="card-body text-center">

                            <h3 className={`text-${card.color} mb-1`}>

                                {card.valor}

                            </h3>

                            <small className="text-muted">

                                {card.titulo}

                            </small>

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

}

export default ResumenCards;