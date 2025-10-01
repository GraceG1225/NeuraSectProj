'use client';
import { useEffect, useState } from 'react';

interface Dataset {
  id: string;
  title: string;
}

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

    useEffect(() => {
        async function fetchDatasets() {
            const res = await fetch('/api/dataset');
            const data: Dataset[] = await res.json();
            setDatasets(data);
        }
        fetchDatasets();
    }, []);

  return (
    <div>
      <h1> Datasets:</h1>
        <ul className="mt-4 space-y-2">
            {datasets.map((dataset) => (
            <li key={dataset.id}>{dataset.title}</li>
          ))}
        </ul>
    </div>
  );
}
