// AddCourseDialog.tsx
import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box
} from '@mui/material';
import {textFieldStyles, primaryButtonStyles, secondaryButtonStyles} from '../../utils/formStyles';

interface AddCourseDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: {
        title: string;
        description: string;
        batch_days: string;
        batch_time: string;
        capacity: number;
        course_fee: number;
    }) => void;
}

export default function AddCourseDialog({open, onClose, onSave}: AddCourseDialogProps) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        batch_days: '',     // ← consider renaming to batch_days for consistency
        batch_time: '',
        capacity: 0,
        course_fee: 0,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === 'capacity' || name === 'course_fee'
                    ? Number(value) || 0   // convert to number, default 0 if invalid/empty
                    : value,
        }));
    };


    const handleSubmit = () => {
        if (!form.title.trim() || !form.batch_days) {
            alert('Title and Batch Days are required');
            return;
        }

        onSave(form);
        onClose();
        setForm({title: '', description: '', batch_days: '', batch_time: '', capacity: 0, course_fee: 0}); // reset
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogContent>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2}}>
                    <TextField
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        fullWidth
                        sx={textFieldStyles}
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        fullWidth
                        sx={textFieldStyles}
                    />
                    <FormControl fullWidth required sx={textFieldStyles}>
                        <InputLabel>Batch Days</InputLabel>
                        <Select
                            name="batch_days"
                            value={form.batch_days}
                            label="Batch Days"
                            onChange={(e) => handleChange(e as any)}
                        >
                            <MenuItem value="Mon-Wed-Fri">SAT-MON-WED</MenuItem>
                            <MenuItem value="Tue-Thu-Sat">SUN-TUE-THU</MenuItem>
                            <MenuItem value="Weekend">Weekend</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Batch Start Date & Time"
                        name="batch_time"
                        type="datetime-local"
                        value={form.batch_time || ''}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={textFieldStyles}
                        slotProps={{
                            inputLabel: {shrink: true}
                        }}
                    />

                    <TextField
                        label="Capacity (students)"
                        name="capacity"
                        type="number"
                        value={form.capacity ?? ''}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={textFieldStyles}
                        slotProps={{
                            htmlInput: {min: 0, step: 1}
                        }}
                    />

                    <TextField
                        label="Course Fee (BDT)"
                        name="course_fee"
                        type="number"
                        value={form.course_fee ?? 0}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={textFieldStyles}
                        slotProps={{
                            htmlInput: {min: 0, step: 1}
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={secondaryButtonStyles}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={primaryButtonStyles}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}