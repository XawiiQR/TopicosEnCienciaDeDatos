import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  dataFrame: any; // El DataFrame (Danfo.js DataFrame)
}

const Grafica: React.FC<Props> = ({ dataFrame }) => {
  // Sumar las poblaciones y calcular los porcentajes
  let weightedWhite = 0;
  let weightedBlack = 0;
  let weightedAsian = 0;
  let weightedHispanic = 0;
  let totalPopulation = 0;

  // Iterar sobre cada registro y calcular los valores ponderados
  dataFrame["total_population"].values.forEach(
    (population: number, index: number) => {
      const whitePercentage = dataFrame["white"].values[index];
      const blackPercentage = dataFrame["black"].values[index];
      const asianPercentage = dataFrame["asian"].values[index];
      const hispanicPercentage = dataFrame["hispanic"].values[index];

      // Calcular los valores ponderados
      weightedWhite += whitePercentage * population;
      weightedBlack += blackPercentage * population;
      weightedAsian += asianPercentage * population;
      weightedHispanic += hispanicPercentage * population;

      totalPopulation += population;
    }
  );

  // Calcular los porcentajes ponderados
  const percentWhite = (weightedWhite / totalPopulation) * 100;
  const percentBlack = (weightedBlack / totalPopulation) * 100;
  const percentAsian = (weightedAsian / totalPopulation) * 100;
  const percentHispanic = (weightedHispanic / totalPopulation) * 100;

  // Datos para el gráfico de pastel
  const data = [
    { label: "White", value: percentWhite },
    { label: "Black", value: percentBlack },
    { label: "Asian", value: percentAsian },
    { label: "Hispanic", value: percentHispanic },
  ];

  // Referencia para el SVG donde se dibujará el gráfico
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Dimensiones del gráfico
    const width = 400;
    const height = 400;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Crear un SVG donde se dibujará el gráfico
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`); // Centrar el gráfico

    // Definir el arco del gráfico de pastel
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Definir el generador de color
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Definir el generador de pie
    const pie = d3
      .pie()
      .value((d: any) => d.value)
      .sort(null);

    // Dibujar los sectores del gráfico de pastel
    svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d: any, i: number) => color(i))
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Añadir las etiquetas
    svg
      .selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d: any) => `${d.data.label}: ${d.data.value.toFixed(2)}%`)
      .style("font-size", "14px")
      .style("fill", "white");
  }, [data]);

  return (
    <div>
      <h4>Gráfico de Pastel - Distribución de Población por Raza</h4>
      {/* Este es el contenedor para el gráfico de pastel */}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Grafica;
