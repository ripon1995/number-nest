import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Stack, Tooltip, Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import type {Student} from "../../types/student.ts";
import {AppRoutes} from '../../constants/appRoutes';

interface StudentListWithActionsProps {
    students: Student[];
}

export function StudentListWithActions({students}: StudentListWithActionsProps) {
    const navigate = useNavigate();

    const getCourseChip = (courseName?: string) => {
        if (!courseName) {
            return (
                <Chip
                    label="N/A"
                    size="small"
                    sx={{
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        fontWeight: 500
                    }}
                />
            );
        }

        return (
            <Chip
                label={courseName}
                size="small"
                sx={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    fontWeight: 500
                }}
            />
        );
    };

    const handleView = (id: string) => {
        navigate(AppRoutes.getStudentDetailPath(id), {state: {mode: 'view'}});
    };

    const handleEdit = (id: string) => {
        navigate(AppRoutes.getStudentDetailPath(id), {state: {mode: 'edit'}});
    };

    const handleDelete = (id: string) => {
        // TODO: Implement delete functionality
        if (window.confirm('Are you sure you want to delete this student?')) {
            console.log('Delete student:', id);
            // Call delete API here
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} aria-label="students table">
                <TableHead>
                    <TableRow>
                        <TableCell>SL</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="left">Phone Number</TableCell>
                        <TableCell align="left">College</TableCell>
                        <TableCell align="left">Father's Name</TableCell>
                        <TableCell align="left">Father's Contact</TableCell>
                        <TableCell align="left">Email</TableCell>
                        <TableCell align="left">Course</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((student, index) => (
                        <TableRow
                            key={student.id!}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <TableCell align="left">{index + 1}</TableCell>
                            <TableCell align="left">{student.name}</TableCell>
                            <TableCell align="left">{student.phone_number}</TableCell>
                            <TableCell align="left">{student.college}</TableCell>
                            <TableCell align="left">{student.father_name}</TableCell>
                            <TableCell align="left">{student.father_contact}</TableCell>
                            <TableCell align="left">{student.email}</TableCell>
                            <TableCell align="left">{getCourseChip(student.course_name)}</TableCell>
                            <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                    <Tooltip title="View">
                                        <IconButton color="primary" onClick={() => handleView(student.id!)}>
                                            <ViewIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton color="secondary" onClick={() => handleEdit(student.id!)}>
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton color="error" onClick={() => handleDelete(student.id!)}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
