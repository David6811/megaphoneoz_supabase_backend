import { createTheme, alpha } from '@mui/material'
import { deepPurple, indigo, cyan, orange, pink } from '@mui/material/colors'

declare module '@mui/material/styles' {
  interface Theme {
    gradients: {
      primary: string
      secondary: string
      success: string
      warning: string
      error: string
      info: string
    }
  }
  
  interface ThemeOptions {
    gradients?: {
      primary?: string
      secondary?: string
      success?: string
      warning?: string
      error?: string
      info?: string
    }
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1', // Modern indigo
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EC4899', // Modern pink
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981', // Modern emerald
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Modern amber
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Modern red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#06B6D4', // Modern cyan
      light: '#22D3EE',
      dark: '#0891B2',
    },
    background: {
      default: '#F8FAFC', // Slightly blue-tinted white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // Modern slate
      secondary: '#475569',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    error: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
    h1: {
      fontWeight: 700,
      fontSize: '1.875rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.6875rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.8125rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.12)',
    '0px 8px 16px rgba(0,0,0,0.14)',
    '0px 16px 32px rgba(0,0,0,0.16)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.18)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ size }) => ({
          borderRadius: 8,
          padding: size === 'large' ? '10px 20px' : size === 'small' ? '6px 12px' : '8px 16px',
          fontSize: size === 'large' ? '0.875rem' : size === 'small' ? '0.75rem' : '0.8125rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          minHeight: size === 'large' ? '40px' : size === 'small' ? '28px' : '32px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        }),
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRight: 'none',
          '& .MuiListItemIcon-root': {
            color: 'rgba(255, 255, 255, 0.8)',
          },
          '& .MuiListItemText-primary': {
            color: 'white',
            fontWeight: 500,
          },
          '& .MuiListItemButton-root': {
            borderRadius: '0 25px 25px 0',
            margin: '4px 8px 4px 0',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: '#0F172A',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8FAFC',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#475569',
          borderBottom: '2px solid #E2E8F0',
        },
      },
    },
  },
})