import React, { useState } from "react";
import Papa from "papaparse";

function CsvUploader() {
  const [data, setData] = useState<Array<Record<string, any>>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setData(results.data as Array<Record<string, any>>);
        },
      });
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
