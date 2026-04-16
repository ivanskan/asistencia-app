import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Cell
} from "recharts";

function GraficoCursosBar({ programados, asistencia }) {

  // ⚡ optimización
  const asistenciaSet = useMemo(
    () => new Set(asistencia.map(a => a.dni)),
    [asistencia]
  );

  const data = useMemo(() => {

    const cursos = {};

    programados.forEach(p => {
      if (!cursos[p.curso]) {
        cursos[p.curso] = { total: 0, presentes: 0 };
      }

      cursos[p.curso].total++;

      if (asistenciaSet.has(p.dni)) {
        cursos[p.curso].presentes++;
      }
    });

    return Object.keys(cursos)
      .map(curso => {
        const total = cursos[curso].total;
        const presentes = cursos[curso].presentes;
        const porcentaje = total > 0 ? (presentes / total) * 100 : 0;

        return {
          curso: curso.length > 12 ? curso.slice(0, 12) + "..." : curso,
          asistentes: presentes,
          total: total,
          porcentaje,
          label: `${presentes}/${total} (${Math.round(porcentaje)}%)`
        };
      })
      .sort((a, b) => b.total - a.total) // 👈 importante
      .slice(0, 6);

  }, [programados, asistenciaSet]);

  // 🎨 color dinámico
  const getColor = (p) => {
    if (p > 80) return "#22c55e";
    if (p >= 50) return "#facc15";
    return "#ef4444";
  };

  // 📏 escala fija (evita barras pequeñas)
  const maxTotal = Math.max(...data.map(d => d.total), 1);

  if (data.length === 0) {
    return <p style={{ color: "white" }}>Sin datos</p>;
  }

  return (
    <div style={{ width: "100%", height: 260 }}>

      <BarChart
        width={520}
        height={260}
        data={data}
      >
        <XAxis dataKey="curso" stroke="#fff" />
        
        <YAxis 
          stroke="#fff"
          domain={[0, maxTotal]} // 👈 CLAVE
          tickCount={5}
        />

        {/* FONDO = TOTAL */}
        <Bar
          dataKey="total"
          fill="#1e293b"
          isAnimationActive={false}
        />

        {/* ASISTENTES */}
        <Bar
          dataKey="asistentes"
          isAnimationActive={true}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.porcentaje)} />
          ))}

          <LabelList
            dataKey="label"
            position="top"
            fill="#fff"
            fontSize={12}
          />
        </Bar>

      </BarChart>

    </div>
  );
}

export default React.memo(GraficoCursosBar);