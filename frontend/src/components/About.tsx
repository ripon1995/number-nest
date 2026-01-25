import {useNavigate} from 'react-router-dom';
import {Paper, Typography, Box, Grid, Card, CardContent} from '@mui/material';
import {AppPage} from './Common-component/AppPage';
import {AppRoutes} from '../constants/appRoutes';
import {School, Group, EmojiEvents, TrendingUp} from '@mui/icons-material';
import {colors} from '../utils/colors';

export default function About() {
    const navigate = useNavigate();

    const handleBackToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    const features = [
        {
            icon: School,
            title: 'Quality Education',
            description: 'We provide top-notch educational resources and courses designed to help students excel in their academic journey.',
            color: colors.primary.main,
        },
        {
            icon: Group,
            title: 'Expert Instructors',
            description: 'Learn from experienced educators who are passionate about teaching and committed to student success.',
            color: colors.secondary.main,
        },
        {
            icon: EmojiEvents,
            title: 'Proven Results',
            description: 'Our students consistently achieve excellent results and go on to succeed in their chosen fields.',
            color: colors.accent.teal,
        },
        {
            icon: TrendingUp,
            title: 'Continuous Growth',
            description: 'We continuously update our curriculum and teaching methods to stay current with educational trends.',
            color: colors.accent.orange,
        },
    ];

    return (
        <AppPage
            headerTitle="About Us"
            headerButtonText="Back to Dashboard"
            headerOnAction={handleBackToDashboard}
        >
            <Box sx={{p: 3}}>
                <Paper elevation={2} sx={{p: 4, mb: 4}}>
                    <Typography variant="h3" component="h1" gutterBottom align="center">
                        About Number Nest
                    </Typography>
                    <Typography variant="h6" component="p" color="text.secondary" align="center" sx={{mb: 4}}>
                        Empowering students through quality education and innovative learning solutions
                    </Typography>

                    <Typography variant="body1" paragraph sx={{fontSize: '1.1rem', lineHeight: 1.8}}>
                        Number Nest is a comprehensive educational platform dedicated to providing students with the
                        tools and resources they need to succeed. Our mission is to make quality education accessible
                        to all students, regardless of their background or location.
                    </Typography>

                    <Typography variant="body1" paragraph sx={{fontSize: '1.1rem', lineHeight: 1.8}}>
                        We believe in a holistic approach to education that focuses not just on academic excellence,
                        but also on developing critical thinking skills, creativity, and a lifelong love of learning.
                    </Typography>
                </Paper>

                <Typography variant="h4" component="h2" gutterBottom sx={{mb: 3}}>
                    What We Offer
                </Typography>

                <Grid container spacing={3}>
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{textAlign: 'center', p: 3}}>
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: `${feature.color}20`,
                                                margin: '0 auto 16px',
                                            }}
                                        >
                                            <IconComponent sx={{fontSize: 32, color: feature.color}} />
                                        </Box>
                                        <Typography variant="h6" component="h3" gutterBottom>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                <Paper elevation={2} sx={{p: 4, mt: 4, background: `linear-gradient(135deg, ${colors.primary.main}15 0%, ${colors.secondary.main}15 100%)`}}>
                    <Typography variant="h5" component="h2" gutterBottom align="center">
                        Our Vision
                    </Typography>
                    <Typography variant="body1" align="center" sx={{fontSize: '1.1rem', lineHeight: 1.8}}>
                        To be the leading educational platform that transforms lives through accessible,
                        high-quality education and empowers students to achieve their full potential.
                    </Typography>
                </Paper>
            </Box>
        </AppPage>
    );
}
