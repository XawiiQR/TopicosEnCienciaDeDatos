import React from "react";
import * as dfd from "danfojs";

interface Props {
  dataFrame: dfd.DataFrame;
  attribute: string;
}

const Rangos2: React.FC<Props> = ({ dataFrame, attribute }) => {
  // Aquí puedes trabajar con el DataFrame y el atributo seleccionado
  // Por ejemplo, calcular estadísticas, rangos, etc.
  
  return (
    <div className="rangos-container">
      <h3>Análisis para: {attribute}</h3>
      <p>Tipo de dato: {dataFrame[attribute].dtype}</p>
      
      {/* Aquí puedes agregar más visualizaciones específicas para el atributo */}
    </div>
  );
};

export default Rangos2;