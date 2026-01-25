import {Card, CardContent, Typography, Grid, Box} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {School, Info, ContactMail} from '@mui/icons-material';
import {colors} from '../../utils/colors';
import {AppRoutes} from '../../constants/appRoutes';

const navigationItems = [
    {
        title: 'Students',
        icon: School,
        route: AppRoutes.STUDENTS,
        description: 'Manage student information',
        color: colors.primary.main,
    },
    {
        title: 'About',
        icon: Info,
        route: AppRoutes.ABOUT,
        description: 'Learn more about us',
        color: colors.secondary.main,
    },
    {
        title: 'Contact',
        icon: ContactMail,
        route: AppRoutes.CONTACT,
        description: 'Get in touch with us',
        color: colors.accent.teal,
    },
];

export const NavigationCards = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{mt: 4, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Typography variant="h5" component="h2" gutterBottom sx={{mb: 3, fontWeight: 'bold'}}>
                Quick Access
            </Typography>
            <Box sx={{display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1000}}>
                {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <Box key={item.title} sx={{width: 280, minWidth: 280}}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6,
                                    },
                                    height: '100%',
                                    minHeight: 200,
                                }}
                                onClick={() => navigate(item.route)}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            py: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: `${item.color}20`,
                                                mb: 2,
                                            }}
                                        >
                                            <IconComponent sx={{fontSize: 32, color: item.color}} />
                                        </Box>
                                        <Typography variant="h6" component="h3" gutterBottom>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.description}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
