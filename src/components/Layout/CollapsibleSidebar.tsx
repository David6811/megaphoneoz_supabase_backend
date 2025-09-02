import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material'
import {
  Article as ArticleIcon,
  Comment as CommentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

const drawerWidthExpanded = 240
const drawerWidthCollapsed = 64

interface CollapsibleSidebarProps {
  mobileOpen: boolean
  onMobileToggle: () => void
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  mobileOpen,
  onMobileToggle,
  expanded,
  onExpandedChange
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && expanded) {
      onExpandedChange(false)
    }
  }, [isMobile, expanded, onExpandedChange])

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Posts', icon: <ArticleIcon />, path: '/dashboard/posts' },
    { text: 'Comments', icon: <CommentIcon />, path: '/dashboard/comments', badge: 3 },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' }
  ]

  const handleToggle = () => {
    if (!isMobile) {
      onExpandedChange(!expanded)
    }
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      onMobileToggle()
    }
  }

  const SidebarContent = () => (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        overflow: 'hidden',
        width: expanded ? drawerWidthExpanded : drawerWidthCollapsed,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        })
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64
        }}
      >
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                CMS Admin
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isMobile && (
          <IconButton
            onClick={handleToggle}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              width: 32,
              height: 32
            }}
          >
            {expanded ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Navigation Items */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item, index) => {
          const isSelected = location.pathname === item.path
          
          return (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <Tooltip
                  title={!expanded ? item.text : ''}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: expanded ? '0 20px 20px 0' : '8px',
                      mx: expanded ? 0 : 'auto',
                      width: expanded ? 'auto' : 40,
                      height: 40,
                      minHeight: 40,
                      justifyContent: expanded ? 'flex-start' : 'center',
                      bgcolor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(2px)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        minWidth: expanded ? 40 : 24,
                        justifyContent: 'center'
                      }}
                    >
                      {item.badge ? (
                        <Badge 
                          badgeContent={item.badge} 
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.625rem',
                              height: 16,
                              minWidth: 16
                            }
                          }}
                        >
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    
                    <Collapse in={expanded} orientation="horizontal">
                      <ListItemText
                        primary={item.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                    </Collapse>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </motion.div>
          )
        })}
      </List>
    </Box>
  )

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: expanded ? drawerWidthExpanded : drawerWidthCollapsed,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            border: 'none',
            overflow: 'visible'
          }
        }}
        open
      >
        <SidebarContent />
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidthExpanded,
            border: 'none'
          }
        }}
      >
        <SidebarContent />
      </Drawer>
    </>
  )
}

export { drawerWidthExpanded, drawerWidthCollapsed }