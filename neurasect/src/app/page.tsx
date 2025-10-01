'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <div className="centered-div">
      <h1 className="text-2xl">Datasets:</h1>
        <ul className="list-disc mt-4 space-y-2">
            {datasets.map((dataset) => (
            <li key={dataset.id}>
              <Link href={`/datasets/${dataset.id}`}>
              {dataset.title}
              </Link>
            </li>
          ))}
        </ul>
    </div>
  );
}
