// Usamos D3 para crear el contenedor principal y las dos secciones
const container = d3.select("body").append("div").attr("class", "container");

// Parte izquierda para los atributos de los CSV
const leftSection = container.append("div").attr("class", "left");

// Parte derecha (donde se crearán las filas y los cuadros)
const rightSection = container.append("div").attr("class", "right");

// Función para formatear los números como "1k" o "1m"
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "m";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num;
  }
}

// Función para formatear los ticks de los ejes
function formatTickValue(d) {
  if (d >= 1000000) {
    return d3.format(".1f")(d / 1000000) + "m";
  } else if (d >= 1000) {
    return d3.format(".1f")(d / 1000) + "k";
  }
  return d;
}

// Función para renderizar el mapa coroplético
function renderChoroplethMap(column, data, box) {
  // Limpiar el cuadro
  box.selectAll("*").remove();

  // Título del cuadro
  box
    .append("h3")
    .text(column === "FIPS" ? "Mapa por Códigos FIPS" : "Mapa por Estados")
    .style("text-align", "center");

  // Contenedor SVG para el mapa
  const width = 800;
  const height = 500;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const svg = box
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#f9f9f9");

  // Proyección para el mapa de EE.UU.
  const projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(width);

  const path = d3.geoPath().projection(projection);

  // Tooltip para mostrar información al pasar el mouse
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("pointer-events", "none");

  // Cargar los datos geoespaciales de EE.UU.
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
    .then(function (us) {
      const states = topojson.feature(us, us.objects.states).features;

      // Dibujar los estados
      svg
        .selectAll(".state")
        .data(states)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .style("fill", "#4e79a7")
        .style("stroke", "#fff")
        .style("stroke-width", "1px")
        .on("mouseover", function (event, d) {
          d3.select(this).style("fill", "#2e5984");

          // Obtener el FIPS del estado
          const stateFips = d.id;
          // Buscar el nombre del estado correspondiente al FIPS
          const stateName = data.find(
            (row) => row.FIPS === stateFips.toString()
          )?.Province_State;

          // Mostrar tooltip con la información relevante
          tooltip.transition().duration(200).style("opacity", 0.9);

          if (column === "FIPS") {
            tooltip
              .html(`FIPS: ${stateFips}`)
              .style("left", event.pageX + 5 + "px")
              .style("top", event.pageY - 28 + "px");
          } else {
            tooltip
              .html(`Estado: ${stateName}<br>FIPS: ${stateFips}`)
              .style("left", event.pageX + 5 + "px")
              .style("top", event.pageY - 28 + "px");
          }
        })
        .on("mouseout", function () {
          d3.select(this).style("fill", "#4e79a7");
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Opcional: agregar leyenda o título
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Mapa de Estados Unidos");
    })
    .catch(function (error) {
      console.error("Error al cargar los datos geoespaciales:", error);
      box
        .append("div")
        .text("Error al cargar el mapa. Por favor intente nuevamente.")
        .style("color", "red");
    });
}

// Función para crear el cuadro con estadísticas en la parte derecha
function createBox(column, data, rightSection) {
  // Verificar si es un atributo categórico especial
  const isSpecialCategorical = column === "FIPS" || column === "Province_State";

  // Crear un contenedor de filas si no existe
  let currentRow = rightSection.select(".row:last-child");

  // Si no hay filas o la última fila está llena, crear una nueva fila
  if (currentRow.empty() || currentRow.selectAll(".content-box").size() >= 3) {
    currentRow = rightSection.append("div").attr("class", "row");
  }

  // Crear el cuadro dentro de la fila actual
  const box = currentRow
    .append("div")
    .attr("id", `box-${column}`)
    .attr("class", "content-box");

  // Si es un atributo categórico especial, mostrar el mapa directamente
  if (isSpecialCategorical) {
    renderChoroplethMap(column, data, box);
    return; // Salir de la función ya que no necesitamos el resto para estos casos
  }

  // Extraer y procesar valores numéricos de la columna
  const values = data
    .map((row) => parseFloat(row[column]))
    .filter((v) => !isNaN(v));
  const nonNullValues = values.filter((v) => v !== null && v !== undefined);
  const uniqueValues = new Set(nonNullValues).size;
  const min = Math.min(...nonNullValues);
  const max = Math.max(...nonNullValues);
  const sorted = [...nonNullValues].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)] || 0;
  const median = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const q3 = sorted[Math.floor(sorted.length * 0.75)] || 0;
  const mean = nonNullValues.length
    ? nonNullValues.reduce((a, b) => a + b, 0) / nonNullValues.length
    : 0;
  const iqr = q3 - q1; // Rango intercuartílico para boxplot y outliers

  // Contenedor SVG
  const width = 300;
  const height = 250;
  const margin = { top: 60, right: 30, bottom: 80, left: 50 }; // Espacio para selector
  const svgContainer = box.append("div").attr("class", "svg-container");
  let svg = svgContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("margin", "auto");

  // Selector desplegable (arriba)
  const select = box
    .insert("select", ":first-child") // Insertar al inicio
    .attr("class", "viz-selector")
    .on("change", function () {
      const selectedOption = d3.select(this).property("value");
      updateVisualization(selectedOption, column, data);
    });

  const options = [
    { value: "stats", text: "Estadísticas Descriptivas" },
    { value: "boxplot", text: "Boxplot" },
  ];

  select
    .selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .attr("value", (d) => d.value)
    .text((d) => d.text);

  // Contenedor para información adicional
  const infoContainer = box.append("div").attr("class", "info-container");

  // Función para actualizar la visualización
  function updateVisualization(type, column, data) {
    svg.selectAll("*").remove();
    infoContainer.selectAll("*").remove();

    // Verificar si el atributo es no numérico
    const isNonNumeric = [
      //"Fin",
      //"Inicio",
      //"Last_Update",
      // "geoid_o",
      //"geoid_d",
      "FIPS",
      "Province_State",
    ].includes(column);

    if (isNonNumeric) {
      // Mostrar cuadro vacío para atributos no numéricos
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("No disponible para este tipo de dato");
      return;
    }

    const x = d3
      .scaleLinear()
      .domain([min, max])
      .range([margin.left, width - margin.right])
      .nice();

    if (type === "stats") {
      renderStats(x);
    } else if (type === "boxplot") {
      renderBoxplot(x);
    }
  }

  // Renderizar estadísticas descriptivas
  function renderStats(x) {
    const bins = d3.bin().domain([min, max]).thresholds(20)(nonNullValues);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length) || 1])
      .range([height - margin.bottom, margin.top])
      .nice();

    // Barras del histograma con animación
    svg
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.x0 ?? 0))
      .attr("y", height - margin.bottom)
      .attr("width", (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0) - 1))
      .attr("height", 0)
      .attr("fill", "#4e79a7")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#2e5984");
        const tooltip = svg
          .append("g")
          .attr("class", "tooltip")
          .attr(
            "transform",
            `translate(${x(d.x0 ?? 0) + (x(d.x1 ?? 0) - x(d.x0 ?? 0)) / 2}, ${
              y(d.length) - 10
            })`
          );
        tooltip
          .append("rect")
          .attr("x", -60)
          .attr("y", -25)
          .attr("width", 120)
          .attr("height", 35)
          .attr("fill", "white")
          .attr("stroke", "black")
          .attr("stroke-width", 1);
        tooltip
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "#000")
          .text(
            `[${formatNumber(d.x0 ?? 0)}, ${formatNumber(
              d.x1 ?? 0
            )}]: ${formatNumber(d.length)}`
          );
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#4e79a7");
        svg.select(".tooltip").remove();
      })
      .transition()
      .duration(800)
      .attr("y", (d) => y(d.length))
      .attr("height", (d) => height - margin.bottom - y(d.length));

    // Ejes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(formatTickValue).ticks(5))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(formatTickValue).ticks(5));

    // Líneas de estadísticas
    svg
      .append("line")
      .attr("x1", x(mean))
      .attr("x2", x(mean))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "blue")
      .attr("stroke-width", 2);

    svg
      .append("line")
      .attr("x1", x(q1))
      .attr("x2", x(q1))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "purple")
      .attr("stroke-width", 2);

    svg
      .append("line")
      .attr("x1", x(q3))
      .attr("x2", x(q3))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "green")
      .attr("stroke-width", 2);

    // Leyenda
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left - 20},${height - margin.bottom + 70})`
      );

    const legendData = [
      { color: "blue", text: "Media" },
      { color: "purple", text: "Q1" },
      { color: "green", text: "Q3" },
    ];

    legend
      .selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 100}, 0)`)
      .each(function (d) {
        const g = d3.select(this);
        g.append("line")
          .attr("x1", 0)
          .attr("x2", 20)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke", d.color)
          .attr("stroke-width", 2);
        g.append("text")
          .attr("x", 25)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .style("font-size", "10px")
          .text(d.text);
      });

    // Etiquetas de los ejes
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 35)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(column);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 8)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Frecuencia");

    // Estadísticas descriptivas
    const stats = [
      { label: "Valores no nulos", value: nonNullValues.length },
      { label: "Valores únicos", value: uniqueValues },
      { label: "Mínimo", value: formatNumber(min) },
      { label: "25% (Q1)", value: formatNumber(q1) },
      { label: "50% (Mediana)", value: formatNumber(median) },
      { label: "75% (Q3)", value: formatNumber(q3) },
      { label: "Promedio", value: formatNumber(mean) },
      { label: "Máximo", value: formatNumber(max) },
    ];

    infoContainer
      .append("div")
      .attr("class", "stats-container")
      .selectAll(".stat-item")
      .data(stats)
      .enter()
      .append("div")
      .attr("class", "stat-item")
      .html(
        (d) =>
          `<span class="stat-label">${d.label}:</span> <span class="stat-value">${d.value}</span>`
      );
  }

  // Renderizar boxplot
  function renderBoxplot(x) {
    const outliers = nonNullValues.filter(
      (v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr
    );

    svg
      .append("rect")
      .attr("x", x(q1))
      .attr("y", height / 2 - 10)
      .attr("width", x(q3) - x(q1))
      .attr("height", 20)
      .attr("fill", "#4e79a7");

    svg
      .append("line")
      .attr("x1", x(min))
      .attr("x2", x(q1))
      .attr("y1", height / 2)
      .attr("y2", height / 2)
      .attr("stroke", "black");

    svg
      .append("line")
      .attr("x1", x(q3))
      .attr("x2", x(max))
      .attr("y1", height / 2)
      .attr("y2", height / 2)
      .attr("stroke", "black");

    svg
      .append("line")
      .attr("x1", x(median))
      .attr("x2", x(median))
      .attr("y1", height / 2 - 10)
      .attr("y2", height / 2 + 10)
      .attr("stroke", "red")
      .attr("stroke-width", 2);

    outliers.forEach((outlier) => {
      svg
        .append("circle")
        .attr("cx", x(outlier))
        .attr("cy", height / 2)
        .attr("r", 3)
        .attr("fill", "red");
    });

    // Eje X
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(formatTickValue).ticks(5))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Leyenda
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${height - margin.bottom + 70})`
      );

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "red")
      .attr("stroke-width", 2);
    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .text("Mediana");

    legend
      .append("circle")
      .attr("cx", 80)
      .attr("cy", 0)
      .attr("r", 3)
      .attr("fill", "red");
    legend
      .append("text")
      .attr("x", 85)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .text("Outliers");

    // Etiqueta de eje
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(column);

    // Información relevante
    const boxplotInfo = [
      { label: "Nº de Outliers", value: outliers.length },
      { label: "Rango Intercuartílico", value: formatNumber(iqr) },
    ];
    infoContainer
      .append("div")
      .attr("class", "stats-container")
      .selectAll(".stat-item")
      .data(boxplotInfo)
      .enter()
      .append("div")
      .attr("class", "stat-item")
      .html(
        (d) =>
          `<span class="stat-label">${d.label}:</span> <span class="stat-value">${d.value}</span>`
      );
  }

  // Inicializar con estadísticas descriptivas
  updateVisualization("stats", column, data);
}

// Función para cargar y combinar atributos de ambos CSV
function loadAndCombineAttributes() {
  Promise.all([
    d3.csv("public/MovilityUsaStates2021.csv"),
    d3.csv("public/CovidUsaStates2021.csv"),
  ])
    .then(([movilityData, covidData]) => {
      // Combinar atributos de ambos CSV
      const allAttributes = [
        ...Object.keys(movilityData[0]),
        ...Object.keys(covidData[0]),
      ];
      const uniqueAttributes = new Set(allAttributes);

      // Agregar botones para todos los atributos
      leftSection
        .append("div")
        .attr("class", "button-container")
        .selectAll("button")
        .data(Array.from(uniqueAttributes))
        .enter()
        .append("button")
        .text((d) => d)
        .attr("class", "csv-button")
        .on("click", function (event, d) {
          // Determinar qué dataset usar basado en el atributo
          const data = movilityData.some((row) => row[d] !== undefined)
            ? movilityData
            : covidData;
          if (!document.querySelector(`#box-${d}`)) {
            createBox(d, data, rightSection);
          } else {
            console.log("Ya existe una ventana con este mensaje.");
          }
        });
    })
    .catch((error) => {
      console.error("Error al cargar los archivos CSV:", error);
    });
}

// Cargar y combinar atributos al iniciar
loadAndCombineAttributes();
