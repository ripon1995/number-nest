import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Stack, Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type {Student} from "../../types/student.ts";

export default function StudentListComponent({students}: { students: Student[] }) {
    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>SL</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="left">Phone Number</TableCell>
                        <TableCell align="left">College</TableCell>
                        <TableCell align="left">Guardian Name</TableCell>
                        <TableCell align="left">Email</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((row, index) => (
                        <TableRow
                            key={row.name}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <TableCell align="left">{index+1}</TableCell>
                            <TableCell align="left">{row.name}</TableCell>
                            <TableCell align="left">{row.phone_number}</TableCell>
                            <TableCell align="left">{row.college}</TableCell>
                            <TableCell align="left">{row.email}</TableCell>
                            <TableCell align="left">{row.father_name}</TableCell>
                            <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                    <Tooltip title="View">
                                        <IconButton color="primary" onClick={() => handleView(row.name)}>
                                            <ViewIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton color="secondary" onClick={() => handleEdit(row.name)}>
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton color="error" onClick={() => handleDelete(row.name)}>
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
