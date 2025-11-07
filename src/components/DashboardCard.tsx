// src/components/DashboardCard.tsx

import React from 'react';

/**
 * Interface for DashboardCard props.
 * 'value', 'unit', and 'status' are made optional ('?') 
 * to allow the card to be used for list-style data (like CMEs) 
 * where a single main value might not be present.
 */
interface DashboardCardProps {
    title: string;
    value?: string | number | null; 
    unit?: string;                  
    status?: string;
    children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, unit, status, children }) => (
    <div style={{ 
        border: '1px solid #333', 
        padding: '20px', 
        margin: '10px', 
        borderRadius: '8px',
        width: '300px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        // Color alert based on status string
        backgroundColor: status && status.includes('Alert') ? '#fdd' : 'white'
    }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#007BFF' }}>{title}</h3>
        {/* Only render value if it exists */}
        {value !== undefined && value !== null && (
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
                {value} {unit}
            </p>
        )}
        {children}
        {/* Render status if it exists */}
        {status && <p style={{ color: status.includes('Alert') ? 'red' : '#00a854', fontWeight: 'bold', marginTop: '10px' }}>{status}</p>}
    </div>
);

export default DashboardCard;