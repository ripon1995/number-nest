// CourseExamScheduleView.tsx
import {Paper, Typography} from '@mui/material';

export const CourseExamScheduleView = () => {
    return (
        <Paper className="view-container" elevation={2} sx={{p: 3}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Exam Schedule
            </Typography>
            <Typography variant="body1" color="text.secondary">
                This content is loaded dynamically via the Route!
            </Typography>
            {/* Your plan logic, tables, or lists go here */}
        </Paper>
    );
};