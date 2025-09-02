import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link
} from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { CollapsibleSidebar, drawerWidthExpanded, drawerWidthCollapsed } from './CollapsibleSidebar'

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode
}

export const EnhancedDashboardLayout: React.FC<EnhancedDashboardLayoutProps> = ({ children }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(!isMobile)

  // Update sidebar state when screen size changes
  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false)
    } else {
      setSidebarExpanded(true)
    }
  }, [isMobile])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    handleClose()
    navigate('/login')
  }

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x)
    const breadcrumbNameMap: { [key: string]: string } = {
      dashboard: 'Dashboard',
      posts: 'Posts',
      comments: 'Comments',
      settings: 'Settings'
    }

    return (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ 
          fontSize: '0.75rem',
          '& .MuiBreadcrumbs-separator': {
            mx: 0.5
          }
        }}
      >
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1
          const to = `/${pathnames.slice(0, index + 1).join('/')}`
          const displayName = breadcrumbNameMap[value] || value

          return last ? (
            <Typography key={to} color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {displayName}
            </Typography>
          ) : (
            <Link
              key={to}
              color="inherit"
              href={to}
              onClick={(e) => {
                e.preventDefault()
                navigate(to)
              }}
              sx={{ 
                fontSize: '0.75rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {displayName}
            </Link>
          )
        })}
      </Breadcrumbs>
    )
  }

  const currentDrawerWidth = isMobile ? 0 : (sidebarExpanded ? drawerWidthExpanded : drawerWidthCollapsed)

  // Force re-render when sidebar state changes
  useEffect(() => {
    // This ensures the layout updates when sidebar state changes
  }, [sidebarExpanded])

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { xs: 0, md: `${currentDrawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          color: theme.palette.text.primary,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              width: 36,
              height: 36
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ 
              fontSize: '1rem',
              fontWeight: 600,
              mb: 0.5
            }}>
              Megaphone OZ
            </Typography>
            {generateBreadcrumbs()}
          </Box>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              color="inherit"
              sx={{ width: 36, height: 36 }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="inherit"
              sx={{ width: 36, height: 36 }}
            >
              <NotificationsIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <CollapsibleSidebar
        mobileOpen={mobileOpen}
        onMobileToggle={handleDrawerToggle}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ml: { xs: 0, md: `${currentDrawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: '16px 20px 20px' }}
        >
          {children}
        </motion.div>
      </Box>

      {/* User Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 160,
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <MenuItem onClick={handleClose} sx={{ fontSize: '0.875rem', py: 1 }}>
          <AccountCircle sx={{ mr: 1, fontSize: '1rem' }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem', py: 1 }}>
          <Logout sx={{ mr: 1, fontSize: '1rem' }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}