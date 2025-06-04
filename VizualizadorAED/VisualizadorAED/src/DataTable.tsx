import React from "react";

type DataTableProps = {
  data: Array<Record<string, any>>;
};

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No hay datos para mostrar</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }} border={1}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              style={{
                padding: "8px",
                backgroundColor: "#f2f2f2",
                textAlign: "left",
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header) => (
              <td key={header} style={{ padding: "8px" }}>
                {row[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
