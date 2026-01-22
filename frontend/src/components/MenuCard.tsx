import React from 'react';
import './MenuCard.css';


interface MenuCardProps {
    title: string;
    icon: React.ReactNode;
    description: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

export default function MenuCard({ title, icon, description, onClick, variant = 'primary' }: MenuCardProps) {
    return (
        <div className={`menu-card ${variant}`} onClick={onClick}>
            <div className="menu-icon">{icon}</div>
            <div className="menu-content">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}