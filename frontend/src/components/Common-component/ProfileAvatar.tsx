import { Avatar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { AppRoutes } from '../../constants/appRoutes';
import { colors } from '../../utils/colors';

export const ProfileAvatar = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();

    const handleClick = () => {
        navigate(AppRoutes.PROFILE);
    };

    const getInitials = (name: string) => {
        const names = name.trim().split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <IconButton onClick={handleClick} sx={{ p: 0 }}>
            <Avatar
                sx={{
                    bgcolor: colors.neutral.white,
                    color: colors.primary.start,
                    fontWeight: 600,
                    width: 45,
                    height: 45,
                    border: `2px solid ${colors.neutral.white}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 4px 12px ${colors.shadowDark}`,
                    }
                }}
            >
                {user?.name ? getInitials(user.name) : 'U'}
            </Avatar>
        </IconButton>
    );
};
