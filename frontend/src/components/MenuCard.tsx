import React from 'react';
import './MenuCard.css';
import {Card, CardActionArea, CardContent, Typography, Box} from '@mui/material';
import {colors} from '../utils/colors';


interface MenuCardProps {
    title: string;
    icon: React.ReactNode;
    description: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

export default function MenuCard({ title, icon, description, onClick, variant = 'primary' }: MenuCardProps) {
    return (
        <Card
            className={`menu-card ${variant}`}
            elevation={1}
            sx={{
                background: colors.card.backgroundAlt,
                borderRadius: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${colors.shadowDark}`,
                    background: colors.card.hover,
                }
            }}
        >
            <CardActionArea onClick={onClick} sx={{height: '100%'}}>
                <CardContent sx={{p: 1.5, '&:last-child': {pb: 1.5}}}>
                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.25}}>
                        <Box
                            className="menu-icon"
                            sx={{
                                fontSize: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.primary.start,
                                flexShrink: 0,
                                mt: 0.25,
                            }}
                        >
                            {icon}
                        </Box>
                        <Box className="menu-content" sx={{flex: 1, minWidth: 0}}>
                            <Typography
                                variant="body2"
                                component="h3"
                                sx={{
                                    fontWeight: 600,
                                    color: colors.primary.start,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.4,
                                }}
                            >
                                {title}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: '0.75rem',
                                    lineHeight: 1.3,
                                    display: 'block',
                                    mt: 0.3,
                                }}
                            >
                                {description}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}