import React from "react";
import * as dfd from "danfojs";

interface Props {
  dataFrame: dfd.DataFrame;
}

const Mapa: React.FC<Props> = ({ dataFrame }) => {
  return (
    <div>
      <h4>Componente Mapa</h4>
      <p>Mostrando un mapa con los primeros 3 registros del dataset:</p>
      <pre>{dataFrame.head(3).toString()}</pre>
      {/* Aquí podrías integrar un mapa, por ejemplo usando Leaflet o Google Maps */}
    </div>
  );
};

export default Mapa;
