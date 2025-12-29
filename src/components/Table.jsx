import React from 'react';
import './Table.css';

const Table = ({ columns, data, actions, emptyMessage = 'No hay datos disponibles' }) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} style={{ width: column.width || 'auto' }}>
                                {column.header}
                            </th>
                        ))}
                        {actions && <th className="text-center">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={row.uid || row.mid || row.cid || row.aid || row._id || row.id || rowIndex}>
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex}>
                                        {column.render 
                                            ? column.render(row[column.accessor], row) 
                                            : row[column.accessor] || '-'}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="text-center">
                                        <div className="action-buttons">
                                            {actions(row)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-4">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
