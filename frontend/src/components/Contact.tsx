import {useNavigate} from 'react-router-dom';
import {Paper, Typography, Box, Grid, TextField, Button} from '@mui/material';
import {AppPage} from './Common-component/AppPage';
import {AppRoutes} from '../constants/appRoutes';
import {Email, Phone, LocationOn} from '@mui/icons-material';
import {colors} from '../utils/colors';
import {textFieldStyles, primaryButtonStyles} from '../utils/formStyles';
import {useState} from 'react';

export default function Contact() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleBackToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement contact form submission
        console.log('Contact form submitted:', formData);
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
        });
    };

    const contactInfo = [
        {
            icon: Email,
            title: 'Email',
            value: 'info@numbernest.com',
            color: colors.primary.main,
        },
        {
            icon: Phone,
            title: 'Phone',
            value: '+1 (555) 123-4567',
            color: colors.secondary.main,
        },
        {
            icon: LocationOn,
            title: 'Address',
            value: '123 Education Street, Learning City, LC 12345',
            color: colors.accent.teal,
        },
    ];

    return (
        <AppPage
            headerTitle="Contact Us"
            headerButtonText="Back to Dashboard"
            headerOnAction={handleBackToDashboard}
        >
            <Box sx={{p: 3}}>
                <Paper elevation={2} sx={{p: 4, mb: 4}}>
                    <Typography variant="h3" component="h1" gutterBottom align="center">
                        Get in Touch
                    </Typography>
                    <Typography variant="h6" component="p" color="text.secondary" align="center" sx={{mb: 4}}>
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </Typography>

                    <Grid container spacing={4}>
                        {contactInfo.map((info, index) => {
                            const IconComponent = info.icon;
                            return (
                                <Grid item xs={12} md={4} key={index}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            p: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: `${info.color}20`,
                                                mb: 2,
                                            }}
                                        >
                                            <IconComponent sx={{fontSize: 28, color: info.color}} />
                                        </Box>
                                        <Typography variant="h6" gutterBottom>
                                            {info.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {info.value}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>

                <Paper elevation={2} sx={{p: 4}}>
                    <Typography variant="h5" component="h2" gutterBottom align="center" sx={{mb: 3}}>
                        Send Us a Message
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    id="name"
                                    name="name"
                                    label="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    sx={textFieldStyles}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    type="email"
                                    id="email"
                                    name="email"
                                    label="Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    sx={textFieldStyles}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    id="subject"
                                    name="subject"
                                    label="Subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    sx={textFieldStyles}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={6}
                                    id="message"
                                    name="message"
                                    label="Message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    sx={textFieldStyles}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{...primaryButtonStyles, mt: 2}}
                                >
                                    Send Message
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        </AppPage>
    );
}
