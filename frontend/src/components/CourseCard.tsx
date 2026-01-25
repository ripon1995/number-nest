import type {Course} from '../types/course';
import {IoCalendarOutline, IoTimeOutline, IoPeopleOutline} from 'react-icons/io5';
import './CourseCard.css';
import {Card, CardContent, Typography, Box, Chip} from '@mui/material';
import {colors} from '../utils/colors';

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({course}: CourseCardProps) {
    return (
        <Card
            className="course-card"
            elevation={3}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                background: colors.card.background,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                minHeight: '140px',
                maxHeight: '160px',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.shadowDark}`,
                    background: colors.card.hover,
                }
            }}
        >
            <CardContent sx={{flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <Box>
                    <Typography
                        variant="h6"
                        component="h2"
                        className="course-title"
                        sx={{fontWeight: 700, color: colors.primary.start, mb: 0.5, fontSize: '1.1rem'}}
                    >
                        {course.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        className="course-description"
                        color="text.secondary"
                        sx={{
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {course.description}
                    </Typography>
                </Box>

                <Box className="course-details" sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                    {/* First line: batch_days and batch_time */}
                    <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                        <Box className="detail-item" sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                            <IoCalendarOutline style={{fontSize: '0.9rem', color: colors.primary.start}} />
                            <Typography variant="caption" sx={{fontSize: '0.75rem'}}>{course.batch_days}</Typography>
                        </Box>

                        <Box className="detail-item" sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                            <IoTimeOutline style={{fontSize: '0.9rem', color: colors.primary.start}} />
                            <Typography variant="caption" sx={{fontSize: '0.75rem'}}>
                                {new Date(course.batch_time).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Second line: capacity and course_fee */}
                    <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                        <Box className="detail-item" sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                            <IoPeopleOutline style={{fontSize: '0.9rem', color: colors.primary.start}} />
                            <Typography variant="caption" sx={{fontSize: '0.75rem'}}>{course.capacity} students</Typography>
                        </Box>

                        <Chip
                            label={`$${course.course_fee}`}
                            size="small"
                            className="course-fee"
                            sx={{
                                background: colors.primary.gradient,
                                color: colors.neutral.white,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '20px',
                            }}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}