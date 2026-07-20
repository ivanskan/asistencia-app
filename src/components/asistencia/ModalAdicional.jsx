function ModalAdicional() {

    return (

        <div
            className="modal fade"
            id="modalAdicional"
            tabIndex="-1"
            aria-hidden="true"
        >

            <div className="modal-dialog modal-lg">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5 className="modal-title">

                            Registrar participante adicional

                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                        />

                    </div>

                    <div className="modal-body">

                        <p className="text-muted mb-0">

                            Aquí construiremos el formulario.

                        </p>

                    </div>

                    <div className="modal-footer">

                        <button
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Cancelar
                        </button>

                        <button
                            className="btn btn-primary"
                        >
                            Registrar
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ModalAdicional;