import './AppHeader.css';
import Logo from '../Logo';
import {AppBar, Toolbar, Button, Typography} from '@mui/material';
import {colors} from '../../utils/colors';
import {ProfileAvatar} from './ProfileAvatar';

interface AppHeaderProps {
    buttonText?: string;
    onAction?: () => void;
    title?: string;
    showProfileAvatar?: boolean;
}

export const AppHeader = ({buttonText, onAction, title, showProfileAvatar}: AppHeaderProps) => (
    <AppBar
        position="static"
        className="app-header"
        sx={{
            background: colors.primary.gradient,
            boxShadow: `0 2px 8px ${colors.shadow}`,
        }}
    >
        <Toolbar
            sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2rem',
                minHeight: '80px',
                gap: 2,
            }}
        >
            <div style={{minWidth: '200px'}}>
                <Logo />
            </div>

            {title && (
                <Typography
                    variant="h6"
                    component="h2"
                    className="header-title"
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: colors.neutral.white,
                        fontWeight: 600,
                        fontSize: '1.75rem',
                        whiteSpace: 'nowrap',
                        zIndex: 1,
                    }}
                >
                    {title}
                </Typography>
            )}

            <div style={{minWidth: '150px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                {showProfileAvatar ? (
                    <ProfileAvatar />
                ) : buttonText ? (
                    <Button
                        variant="contained"
                        className="register-button"
                        onClick={onAction}
                        sx={{
                            backgroundColor: colors.neutral.white,
                            color: colors.primary.start,
                            fontWeight: 600,
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: colors.neutral.white,
                                border: `2px solid ${colors.neutral.white}`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${colors.shadowDark}`,
                            }
                        }}
                    >
                        {buttonText}
                    </Button>
                ) : null}
            </div>
        </Toolbar>
    </AppBar>
);