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

const PRECIO = 15;

export default function Ticket() {
  const [tickets, setTickets] = useState([]);
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
const [filtroPago, setFiltroPago] = useState("todos"); // todos | pagados | nopagados
const [filtroEntrega, setFiltroEntrega] = useState("todos"); // todos | entregados | noentregados

  // 🔴 REALTIME
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      // 🔢 ORDEN ASCENDENTE SEGURO
      data.sort((a, b) => Number(a.numero) - Number(b.numero));

      setTickets(data);
    });

    return () => unsub();
  }, []);

  // ➕ CREAR SOLO 1
  const crearTicket = async () => {
    if (!numero) {
      alert("Ingresa número de ticket");
      return;
    }

    await addDoc(collection(db, "tickets"), {
      numero: Number(numero),
      nombre: nombre || "",
      pagado: false,
      metodoPago: "",
      recogido: false,
      fecha: serverTimestamp()
    });

    setNombre("");
    setNumero("");
  };

  // 💳 MÉTODO = DEFINE PAGO
const cambiarMetodo = async (ticket, metodo) => {
  await updateDoc(doc(db, "tickets", ticket.id), {
    metodoPago: metodo,
    pagado: metodo !== "" // 👈 clave
  });
};
  // 🍗 ENTREGA
  const toggleRecogido = async (ticket) => {
    await updateDoc(doc(db, "tickets", ticket.id), {
      recogido: !ticket.recogido
    });
  };

  // 🗑️ ELIMINAR
  const eliminarTicket = async (ticket) => {
    const ok = window.confirm(`Eliminar ticket #${ticket.numero}?`);
    if (!ok) return;

    await deleteDoc(doc(db, "tickets", ticket.id));
  };

  // 🎨 COLORES
  const getColor = (t) => {
    if (t.pagado && t.recogido) return "#22c55e"; // verde
    if (t.pagado || t.recogido) return "#facc15"; // amarillo
    return "#ef4444"; // rojo
  };

  // 📊 KPIs
  const total = tickets.length;
  const pagados = tickets.filter((t) => t.pagado).length;
  const recogidos = tickets.filter((t) => t.recogido).length;

  const totalRecaudado = pagados * PRECIO;

  const yape = tickets.filter(
    (t) => t.pagado && t.metodoPago === "Yape"
  ).length;

  const efectivo = tickets.filter(
    (t) => t.pagado && t.metodoPago === "Efectivo"
  ).length;


  const ticketsFiltrados = tickets.filter((t) => {
  // 🔎 filtro nombre
  const matchNombre = (t.nombre || "")
    .toLowerCase()
    .includes(filtroNombre.toLowerCase());

  // 💳 filtro pago
  const matchPago =
    filtroPago === "todos" ||
    (filtroPago === "pagados" && t.pagado) ||
    (filtroPago === "nopagados" && !t.pagado);

  // 🍗 filtro entrega
  const matchEntrega =
    filtroEntrega === "todos" ||
    (filtroEntrega === "entregados" && t.recogido) ||
    (filtroEntrega === "noentregados" && !t.recogido);

  return matchNombre && matchPago && matchEntrega;
});

  return (
    <div className="container-fluid" >
      <h2 className="text-center py-3"> Control de Tickets</h2>

      {/* 📊 RESUMEN */}
      <div className="bg-info border rounded p-1">
        <div className="d-flex justify-content-between">
          <span>Total: {total}</span>
          <span>Recogidos: {recogidos} / {total}</span>
          <span>Pagados: {pagados} / {total}</span>
        </div>
        <div className="d-flex justify-content-between my-2">
          <span> Total: S/ {totalRecaudado}</span>
          <span>Yape: S/ {yape * PRECIO}</span>
          <span>Efectivo: S/ {efectivo * PRECIO}</span>
         </div>
      </div>

      {/* ➕ CREAR */}
     <div className="my-3 d-flex align-items-center gap-2 w-100">
  
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
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        style={{ maxWidth: "80px" }} // 👈 3-4 dígitos aprox
      />

      <button className="btn btn-primary" onClick={crearTicket}>
        Agregar
      </button>

    </div>

    <div className="mb-3 d-flex flex-wrap gap-2">

  <input
    className="form-control"
    style={{ maxWidth: "200px" }}
    placeholder="Buscar nombre"
    value={filtroNombre}
    onChange={(e) => setFiltroNombre(e.target.value)}
  />

  <select
    className="form-select"
    style={{ maxWidth: "150px" }}
    value={filtroPago}
    onChange={(e) => setFiltroPago(e.target.value)}
  >
    <option value="todos">Todos</option>
    <option value="pagados">Pagados</option>
    <option value="nopagados">No pagados</option>
  </select>

  <select
    className="form-select"
    style={{ maxWidth: "170px" }}
    value={filtroEntrega}
    onChange={(e) => setFiltroEntrega(e.target.value)}
  >
    <option value="todos">Todos</option>
    <option value="entregados">Entregados</option>
    <option value="noentregados">No entregados</option>
  </select>

</div>

      {/* 🧱 GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 10
        }}
      >
        {ticketsFiltrados.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              borderRadius: 10,
              background: getColor(t),
              color: "#000",
                  position: "relative" // 👈 AÑADIR
            }}
          >
            <button
  onClick={() => eliminarTicket(t)}
  style={{
    position: "absolute",
    top: 5,
    right: 5,
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 25,
    height: 25,
    cursor: "pointer"
  }}
>
  X
</button>
            {/* 🔢 NUMERO SIEMPRE */}
            <strong>Ticket #{t.numero}</strong>

            <div>{t.nombre || "Sin nombre"}</div>

            <div>Pagado: {t.pagado ? "✅" : "❌"}</div>
            <div>Recogido: {t.recogido ? "🍗" : "⏳"}</div>

            {/* SOLO 2 METODOS */}
            <div className="d-flex justify-content-between">
            <select
              value={t.metodoPago}
              onChange={(e) => cambiarMetodo(t, e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Yape">Yape</option>
              <option value="Efectivo">Efectivo</option>
            </select>

            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={() => toggleRecogido(t)}>🍗</button>

            </div>
            </div>
           
          </div>
        ))}
      </div>
    </div>
  );
}