import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Paper, Typography, Box, CircularProgress, Button,
    Checkbox, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow
} from '@mui/material';
import { useStudentStore } from "../../store/useStudentStore.ts";

export const CourseAttendanceView = () => {
    const { id: courseId } = useParams<{ id: string }>();
    const { students, fetchStudents, loading } = useStudentStore();

    // Local state to keep track of who is marked present
    const [presentIds, setPresentIds] = useState<string[]>([]);

    useEffect(() => {
        if (courseId) {
            fetchStudents(courseId);
        }
    }, [courseId, fetchStudents]);

    // Toggle individual student
    const handleToggle = (studentId: string) => {
        setPresentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Select/Deselect all logic
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setPresentIds(students.map(s => s.id!));
        } else {
            setPresentIds([]);
        }
    };

    const handleSave = () => {
        console.log("Saving attendance for course:", courseId);
        console.log("Present Student IDs:", presentIds);
        // TODO: Call your attendance API here
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Paper className="view-container" elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">Attendance</Typography>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={students.length === 0}>
                    Save Attendance
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 400 }}>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell width="10%"><strong>SL</strong></TableCell>
                            <TableCell width="70%"><strong>Student Name</strong></TableCell>
                            <TableCell width="20%" align="center">
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Typography variant="caption">All</Typography>
                                    <Checkbox
                                        size="small"
                                        indeterminate={presentIds.length > 0 && presentIds.length < students.length}
                                        checked={students.length > 0 && presentIds.length === students.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.id} hover>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        checked={presentIds.includes(student.id!)}
                                        onChange={() => handleToggle(student.id!)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};