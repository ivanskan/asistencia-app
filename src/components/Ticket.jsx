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

  return (
    <div style={{ padding: 20 }}>
      <h2>🍗 Control Pollada</h2>

      {/* 📊 RESUMEN */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <div>🎟️ Total: {total}</div>
        <div>✅ Pagados: {pagados} / {total}</div>
        <div>🍗 Recogidos: {recogidos} / {total}</div>
        <div>💰 Total: S/ {totalRecaudado}</div>
        <div>💳 Yape: S/ {yape * PRECIO}</div>
        <div>💵 Efectivo: S/ {efectivo * PRECIO}</div>
      </div>

      {/* ➕ CREAR */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="number"
          placeholder="N° Ticket"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          style={{ width: 120, marginLeft: 10 }}
        />

        <button onClick={crearTicket} style={{ marginLeft: 10 }}>
          Agregar
        </button>
      </div>

      {/* 🧱 GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 10
        }}
      >
        {tickets.map((t) => (
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