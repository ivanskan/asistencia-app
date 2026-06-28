import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

const PRECIO = 10;

export default function Ticket() {

  //==========================
  // STATES
  //==========================

  const [tickets, setTickets] = useState([]);

  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");

  // filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroPago, setFiltroPago] = useState("todos");
  const [filtroEntrega, setFiltroEntrega] = useState("todos");



  //==========================
  // REALTIME
  //==========================

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "tickets"),
      (snapshot) => {

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        data.sort(
          (a, b) => Number(a.numero) - Number(b.numero)
        );

        setTickets(data);

      }
    );

    return () => unsub();

  }, []);




  //==========================
  // CREAR
  //==========================

  const crearTicket = async () => {

    if (!nombre.trim()) {
      alert("Ingrese un nombre");
      return;
    }

    if (!numero) {
      alert("Ingrese un número");
      return;
    }

    // validar duplicado

    const existe = tickets.some(
      (t) => Number(t.numero) === Number(numero)
    );

    if (existe) {
      alert("Ese ticket ya existe");
      return;
    }

    await addDoc(collection(db, "tickets"), {

      numero: Number(numero),
      nombre: nombre.trim(),

      pagado: false,
      metodoPago: "",

      recogido: false,

      fecha: serverTimestamp()

    });

    setNombre("");
    setNumero("");

  };




  //==========================
  // METODO DE PAGO
  //==========================

  const cambiarMetodo = async (ticket, metodo) => {

    await updateDoc(
      doc(db, "tickets", ticket.id),
      {

        metodoPago: metodo,

        pagado: metodo !== ""

      }
    );

  };




  //==========================
  // ENTREGADO
  //==========================

  const toggleRecogido = async (ticket) => {

    await updateDoc(
      doc(db, "tickets", ticket.id),
      {

        recogido: !ticket.recogido

      }
    );

  };




  //==========================
  // ELIMINAR
  //==========================

  const eliminarTicket = async (ticket) => {

    const ok = window.confirm(
      `¿Eliminar Ticket #${ticket.numero}?`
    );

    if (!ok) return;

    await deleteDoc(
      doc(db, "tickets", ticket.id)
    );

  };





  //==========================
  // COLOR CARD
  //==========================

  const getColor = (t) => {

    if (t.pagado && t.recogido)
      return "#22c55e";

    if (t.pagado || t.recogido)
      return "#facc15";

    return "#ef4444";

  };





  //==========================
  // KPIs
  //==========================

  const total = tickets.length;

  const pagados = tickets.filter(
    (t) => t.pagado
  ).length;

  const recogidos = tickets.filter(
    (t) => t.recogido
  ).length;

  const totalRecaudado =
    pagados * PRECIO;

  const yape = tickets.filter(
    (t) =>
      t.pagado &&
      t.metodoPago === "Yape"
  ).length;

  const efectivo = tickets.filter(
    (t) =>
      t.pagado &&
      t.metodoPago === "Efectivo"
  ).length;





  //==========================
  // FILTROS
  //==========================

  const ticketsFiltrados = tickets.filter((t) => {

    // nombre o numero

    const textoBusqueda =
      filtroNombre.toLowerCase();

    const coincideNombre =
      (t.nombre || "")
        .toLowerCase()
        .includes(textoBusqueda);

    const coincideNumero =
      String(t.numero)
        .includes(textoBusqueda);

    const okNombre =
      coincideNombre || coincideNumero;

    // pago

    const okPago =

      filtroPago === "todos"

      ||

      (filtroPago === "pagados"
        && t.pagado)

      ||

      (filtroPago === "nopagados"
        && !t.pagado);

    // entrega

    const okEntrega =

      filtroEntrega === "todos"

      ||

      (filtroEntrega === "entregados"
        && t.recogido)

      ||

      (filtroEntrega === "noentregados"
        && !t.recogido);


    return (
      okNombre &&
      okPago &&
      okEntrega
    );

    

  });

  return (
  <div className="container-fluid">

    <h2 className="text-center py-3">
      🎟️ Control de Tickets
    </h2>

    {/*==========================
        RESUMEN
    ==========================*/}

    <div className="border rounded p-2 mb-3">

      <div className="d-flex justify-content-between flex-wrap">

        <span>
          <strong>Total:</strong> {total}
        </span>

        <span>
          <strong>Recogidos:</strong> {recogidos} / {total}
        </span>

        <span>
          <strong>Pagados:</strong> {pagados} / {total}
        </span>

      </div>

      <div className="d-flex justify-content-between flex-wrap mt-2">

        <span>
          <strong>Total:</strong> S/ {totalRecaudado}
        </span>

        <span>
          <strong>Yape:</strong> S/ {yape * PRECIO}
        </span>

        <span>
          <strong>Efectivo:</strong> S/ {efectivo * PRECIO}
        </span>

      </div>

    </div>



    {/*==========================
        CREAR
    ==========================*/}

    <div className="mb-3 d-flex align-items-center gap-2">

      <input
        className="form-control flex-grow-1"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        className="form-control text-center"
        type="number"
        placeholder="N°"
        style={{ maxWidth: 80 }}
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />

      <button
        className="btn btn-primary"
        onClick={crearTicket}
      >
        Agregar
      </button>

    </div>



    {/*==========================
        FILTROS
    ==========================*/}

    <div className="card mb-3">

      <div className="card-body">

        <div className="row g-2">

          <div className="col-md-4">

            <input
              className="form-control"
              placeholder="Buscar nombre o ticket..."
              value={filtroNombre}
              onChange={(e) =>
                setFiltroNombre(e.target.value)
              }
            />

          </div>

          <div className="col-md-4">

            <select
              className="form-select"
              value={filtroPago}
              onChange={(e) =>
                setFiltroPago(e.target.value)
              }
            >

              <option value="todos">
                Todos los pagos
              </option>

              <option value="pagados">
                Pagados
              </option>

              <option value="nopagados">
                No pagados
              </option>

            </select>

          </div>

          <div className="col-md-4">

            <select
              className="form-select"
              value={filtroEntrega}
              onChange={(e) =>
                setFiltroEntrega(e.target.value)
              }
            >

              <option value="todos">
                Todas las entregas
              </option>

              <option value="entregados">
                Entregados
              </option>

              <option value="noentregados">
                No entregados
              </option>

            </select>

          </div>

        </div>

      </div>

    </div>



    {/*==========================
        GRID
    ==========================*/}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill,minmax(180px,1fr))",
        gap: 12
      }}
    >

      {ticketsFiltrados.map((t) => (

        <div
          key={t.id}
          style={{
            background: getColor(t),
            borderRadius: 10,
            padding: 10,
            position: "relative",
            border: "1px solid #CCC"
          }}
        >

          {/* ELIMINAR */}

          <button
            className="btn btn-dark btn-sm"
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 28,
              height: 28,
              padding: 0,
              borderRadius: "50%"
            }}
            onClick={() =>
              eliminarTicket(t)
            }
          >
            ×
          </button>


          <h5 className="mb-2">
            Ticket #{t.numero}
          </h5>

          <div>
            <strong>
              {t.nombre}
            </strong>
          </div>

          <div className="mt-2">

            Pagado:

            {" "}

            {t.pagado ? "✅" : "❌"}

          </div>

          <div>

            Entregado:

            {" "}

            {t.recogido ? "🍗" : "⏳"}

          </div>


          <div className="mt-3 d-flex gap-2">

            <select
              className="form-select form-select-sm"
              value={t.metodoPago}
              onChange={(e) =>
                cambiarMetodo(
                  t,
                  e.target.value
                )
              }
            >

              <option value="">
                Seleccionar
              </option>

              <option value="Yape">
                Yape
              </option>

              <option value="Efectivo">
                Efectivo
              </option>

            </select>

            <button
              className="btn btn-success btn-sm"
              onClick={() =>
                toggleRecogido(t)
              }
            >
              🍗
            </button>

          </div>

        </div>

      ))}

    </div>

  </div>
);}
