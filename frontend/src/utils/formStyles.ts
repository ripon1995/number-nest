import type {SxProps, Theme} from '@mui/material';
import {colors} from './colors';

// Shared TextField styles for consistent form inputs across the app
export const textFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: colors.primary.start,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.start,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.primary.start,
  },
};

// Shared button styles for primary action buttons
export const primaryButtonStyles: SxProps<Theme> = {
  background: colors.primary.gradient,
  color: colors.neutral.white,
  fontWeight: 600,
  '&:hover': {
    background: colors.primary.gradient,
    opacity: 0.9,
  },
};

// Shared button styles for secondary/outlined buttons
export const secondaryButtonStyles: SxProps<Theme> = {
  color: colors.primary.start,
  borderColor: colors.primary.start,
  '&:hover': {
    borderColor: colors.primary.end,
    backgroundColor: 'rgba(102, 126, 234, 0.04)',
  },
};