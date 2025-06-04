import React, { useEffect, useState } from "react";
import * as dfd from "danfojs";

const DanfoExample: React.FC = () => {
  const [df, setDf] = useState<dfd.DataFrame | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Aquí cambia la ruta a donde tengas tu archivo CSV en public o URL pública
        const dataFrame = await dfd.readCSV("/Boston_feature_df.csv");
        setDf(dataFrame);
        //dataFrame.print();
        //console.table(dataFrame);
        //dataFrame.head().print();
        dataFrame.describe().print();
        //console.table(dataFrame.to_json());
      } catch (err) {
        setError("Error al cargar el CSV");
        console.error(err);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <h2>Ejemplo Danfo.js con TypeScript</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {df ? (
        <pre style={{ whiteSpace: "pre-wrap" }}>{df.toString()}</pre>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default DanfoExample;
