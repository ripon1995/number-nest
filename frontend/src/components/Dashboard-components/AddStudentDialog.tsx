import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    InputAdornment,
    Alert,
    CircularProgress,
    Box,
} from '@mui/material';
import {IoPersonOutline, IoCallOutline, IoSchoolOutline, IoMailOutline, IoKeyOutline} from 'react-icons/io5';
import {textFieldStyles, primaryButtonStyles} from '../../utils/formStyles';
import {useUserStore} from '../../store/useUserStore';
import type {CreateStudentData} from '../../types/user';

interface AddStudentDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddStudentDialog: React.FC<AddStudentDialogProps> = ({open, onClose, onSuccess}) => {
    const createStudentByAdmin = useUserStore((state) => state.createStudentByAdmin);
    const storeError = useUserStore((state) => state.error);

    const [formData, setFormData] = useState<CreateStudentData>({
        name: '',
        phone_number: '',
        password: '',
        father_name: '',
        father_contact: '',
        college: '',
        email: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!formData.phone_number.trim()) {
            setError('Phone number is required');
            return false;
        }
        if (formData.phone_number.length !== 11) {
            setError('Phone number must be 11 digits');
            return false;
        }
        if (!formData.password.trim()) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (!formData.father_name.trim()) {
            setError("Father's name is required");
            return false;
        }
        if (!formData.father_contact.trim()) {
            setError("Father's contact is required");
            return false;
        }
        if (!formData.college.trim()) {
            setError('College is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await createStudentByAdmin(formData);

            if (result) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 1500);
            } else {
                setError(storeError || 'Failed to create student');
                setLoading(false);
            }
        } catch (err) {
            setError((err as Error).message || 'Failed to create student');
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                name: '',
                phone_number: '',
                password: '',
                father_name: '',
                father_contact: '',
                college: '',
                email: '',
            });
            setError(null);
            setSuccess(false);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{pb: 1}}>
                Add New Student
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{mb: 2}}>
                        Student created successfully!
                    </Alert>
                )}

                <Box sx={{mt: 2}}>
                    <Grid container spacing={2}>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Student Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                sx={textFieldStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IoPersonOutline/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                fullWidth
                                id="phone_number"
                                name="phone_number"
                                label="Phone Number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                inputProps={{maxLength: 11}}
                                sx={textFieldStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IoCallOutline/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                sx={textFieldStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IoKeyOutline/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                sx={textFieldStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IoMailOutline/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                fullWidth
                                id="father_name"
                                name="father_name"
                                label="Father's Name"
                                value={formData.father_name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                sx={textFieldStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IoPersonOutline/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                fullWidth
                                id="father_contact"
                                name="father_contact"
                                label="Father's Contact"
                                value={formData.father_contact}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                inputProps={{maxLength: 11}}
                                sx={textFieldStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IoCallOutline/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth
                                id="college"
                                name="college"
                                label="College"
                                value={formData.college}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                sx={textFieldStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IoSchoolOutline/>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{px: 3, pb: 2}}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    sx={primaryButtonStyles}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{mr: 1}} />
                            Creating...
                        </>
                    ) : (
                        'Create Student'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
