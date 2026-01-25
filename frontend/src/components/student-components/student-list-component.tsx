import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Stack, Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon
} from '@mui/icons-material';
import type {Student} from "../../types/student.ts";

export default function StudentListComponent({students}: { students: Student[] }) {
    const handleDelete = (phoneNumber: string) => {
        // TODO: Implement delete functionality
        if (window.confirm('Are you sure you want to remove this student from the course?')) {
            console.log('Delete student:', phoneNumber);
            // Call delete API here
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>SL</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="left">Phone Number</TableCell>
                        <TableCell align="left">College</TableCell>
                        <TableCell align="left">Father's Name</TableCell>
                        <TableCell align="left">Father's Contact</TableCell>
                        <TableCell align="left">Email</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((row, index) => (
                        <TableRow
                            key={row.phone_number}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <TableCell align="left">{index + 1}</TableCell>
                            <TableCell align="left">{row.name}</TableCell>
                            <TableCell align="left">{row.phone_number}</TableCell>
                            <TableCell align="left">{row.college}</TableCell>
                            <TableCell align="left">{row.father_name}</TableCell>
                            <TableCell align="left">{row.father_contact}</TableCell>
                            <TableCell align="left">{row.email}</TableCell>
                            <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                    <Tooltip title="Remove from course">
                                        <IconButton color="error" onClick={() => handleDelete(row.phone_number)}>
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
