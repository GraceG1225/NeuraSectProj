import { supabase } from '../../lib/supabaseClient';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function DatasetPage({ params }: Props) {
    const { id } = await params;

    const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
    return <div>Error: {error.message}</div>;
}

    const tables = ['iris', 'boston', 'youtube', 'insurance', 'carsales'];
  
    const tableQueries = await Promise.all(
        tables.map(async (tableName) => {
            const { data: tableData } = await supabase
            .from(tableName as any)
            .select('*')
            .eq('dataset_id', id);
      
        return {
            tableName,
            data: tableData || [],
            hasData: tableData && tableData.length > 0
        } as { tableName: string; data: any[]; hasData: boolean };
        })
    );

    const tablesWithData = tableQueries.filter(table => table.hasData);

    const allData = {
        table: tablesWithData.reduce((acc, table) => {
            acc[table.tableName] = table.data;
            return acc;
        }, {} as Record<string, any[]>)
    };

    return (
    <div className="p-4">
        <h1 className="text-2xl font-bold">{data.title}</h1>
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>

            <pre>
                {JSON.stringify(allData, null, 2)}
            </pre>
    </div>
    );
}
