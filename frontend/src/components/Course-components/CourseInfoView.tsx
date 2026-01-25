import {useOutletContext} from 'react-router-dom';
import type {Course} from '../../types/course';
import {Paper, Typography, List, ListItem, ListItemText, Divider} from '@mui/material';

export const CourseInfoView = () => {
    const {course} = useOutletContext<{ course: Course | undefined }>();

    if (!course) return <Typography variant="body1" color="text.secondary">No course data found.</Typography>;

    return (
        <Paper className="course-info" elevation={2} sx={{p: 3}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Course Details
            </Typography>
            <Divider sx={{mb: 2}} />
            <List>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="subtitle1" fontWeight="bold">Title</Typography>}
                        secondary={<Typography variant="body1">{course.title}</Typography>}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="subtitle1" fontWeight="bold">Description</Typography>}
                        secondary={<Typography variant="body1">{course.description}</Typography>}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="subtitle1" fontWeight="bold">Batch Days</Typography>}
                        secondary={<Typography variant="body1">{course.batch_days}</Typography>}
                    />
                </ListItem>
            </List>
        </Paper>
    );
};