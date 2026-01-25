import {useEffect, useState} from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import {useStudentStore} from '../store/useStudentStore';
import {AppPage} from './Common-component/AppPage';
import {IoPersonOutline, IoCallOutline, IoSchoolOutline, IoMailOutline} from 'react-icons/io5';
import {
    TextField,
    Alert,
    Box,
    Typography,
    Paper,
    InputAdornment,
    CircularProgress,
    Button,
    Grid
} from '@mui/material';
import {textFieldStyles, primaryButtonStyles} from '../utils/formStyles';
import {AppRoutes} from '../constants/appRoutes';
import type {Student} from '../types/student';

export default function StudentDetail() {
    const {id} = useParams<{id: string}>();
    const location = useLocation();
    const navigate = useNavigate();
    const students = useStudentStore((state) => state.students);
    const fetchStudents = useStudentStore((state) => state.fetchStudents);

    const [mode, setMode] = useState<'view' | 'edit'>(location.state?.mode || 'view');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<Student>({
        name: '',
        phone_number: '',
        father_name: '',
        father_contact: '',
        college: '',
        email: '',
    });

    useEffect(() => {
        const loadStudent = async () => {
            if (students.length === 0) {
                await fetchStudents();
            }

            const foundStudent = students.find(s => s.phone_number === id);

            if (foundStudent) {
                setStudent(foundStudent);
                setFormData(foundStudent);
                setError(null);
            } else {
                setError('Student not found');
            }
            setLoading(false);
        };

        loadStudent();
    }, [id, students, fetchStudents]);

    const handleBack = () => {
        navigate(AppRoutes.STUDENTS);
    };

    const handleEdit = () => {
        setMode('edit');
    };

    const handleCancel = () => {
        setMode('view');
        if (student) {
            setFormData(student);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        // TODO: Implement save functionality
        try {
            console.log('Saving student:', formData);
            // Call update API here
            setStudent(formData);
            setMode('view');
            alert('Student updated successfully!');
        } catch (err) {
            setError('Failed to update student');
        }
    };

    if (loading) {
        return (
            <AppPage
                headerTitle="Student Details"
                headerButtonText="Back to Students"
                headerOnAction={handleBack}
            >
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
                    <CircularProgress />
                </Box>
            </AppPage>
        );
    }

    if (error) {
        return (
            <AppPage
                headerTitle="Student Details"
                headerButtonText="Back to Students"
                headerOnAction={handleBack}
            >
                <Box sx={{p: 2}}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </AppPage>
        );
    }

    return (
        <AppPage
            headerTitle="Student Details"
            headerButtonText="Back to Students"
            headerOnAction={handleBack}
        >
            <Box className="registration-container">
                <Paper className="registration-card" elevation={3} sx={{padding: 4, borderRadius: 2, maxWidth: 800, margin: '0 auto'}}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        {mode === 'view' ? 'Student Information' : 'Edit Student Information'}
                    </Typography>
                    <Typography variant="body1" className="registration-subtitle" align="center" color="text.secondary" sx={{mb: 3}}>
                        {mode === 'view' ? 'View student details' : 'Update student details'}
                    </Typography>

                    <Box sx={{mt: 3}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoPersonOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="phone_number"
                                    name="phone_number"
                                    label="Phone Number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    disabled
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoCallOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="father_name"
                                    name="father_name"
                                    label="Father's Name"
                                    value={formData.father_name}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoPersonOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="father_contact"
                                    name="father_contact"
                                    label="Father's Contact"
                                    value={formData.father_contact}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoCallOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoMailOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="college"
                                    name="college"
                                    label="College"
                                    value={formData.college}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoSchoolOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {mode === 'view' ? (
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleEdit}
                                sx={{...primaryButtonStyles, mt: 4}}
                            >
                                Edit Student
                            </Button>
                        ) : (
                            <Grid container spacing={2} sx={{mt: 2}}>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleSave}
                                        sx={primaryButtonStyles}
                                    >
                                        Save Changes
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Paper>
            </Box>
        </AppPage>
    );
}
