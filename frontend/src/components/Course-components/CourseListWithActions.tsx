import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import {Visibility, Edit, Delete} from '@mui/icons-material';
import type {Course} from '../../types/course';
import {AppRoutes} from '../../constants/appRoutes';
import {useCourseStore} from '../../store/useCourseStore';
import {primaryButtonStyles} from '../../utils/formStyles';

interface CourseListWithActionsProps {
    courses: Course[];
}

export const CourseListWithActions: React.FC<CourseListWithActionsProps> = ({courses}) => {
    const navigate = useNavigate();
    const deleteCourse = useCourseStore((state) => state.deleteCourse);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const handleView = (course: Course) => {
        navigate(AppRoutes.getCoursePath(course.id));
    };

    const handleEdit = (course: Course) => {
        navigate(AppRoutes.getCoursePath(course.id), {state: {mode: 'edit'}});
    };

    const handleDeleteClick = (course: Course) => {
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (courseToDelete) {
            const success = await deleteCourse(courseToDelete.id);
            if (success) {
                console.log('Course deleted successfully');
            }
        }
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
    };

    const formatBatchTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    if (courses.length === 0) {
        return (
            <Paper sx={{p: 3, textAlign: 'center'}}>
                <Typography variant="body1" color="text.secondary">
                    No courses found. Click "Add Course" to create one.
                </Typography>
            </Paper>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Batch Days</strong></TableCell>
                            <TableCell><strong>Batch Time</strong></TableCell>
                            <TableCell><strong>Capacity</strong></TableCell>
                            <TableCell><strong>Fee (BDT)</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id} hover>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>{course.batch_days}</TableCell>
                                <TableCell>{formatBatchTime(course.batch_time)}</TableCell>
                                <TableCell>{course.capacity}</TableCell>
                                <TableCell>{course.course_fee}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View Details">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleView(course)}
                                        >
                                            <Visibility/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Course">
                                        <IconButton
                                            size="small"
                                            color="info"
                                            onClick={() => handleEdit(course)}
                                        >
                                            <Edit/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Course">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteClick(course)}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the course "{courseToDelete?.title}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={primaryButtonStyles}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
