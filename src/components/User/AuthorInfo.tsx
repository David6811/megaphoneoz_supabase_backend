import React, { useState, useEffect } from 'react'
import { Box, Typography, Avatar, Paper, Chip } from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'
import { supabase } from '../../config/supabase'

interface AuthorInfoProps {
  title?: string
  showAvatar?: boolean
  showEmail?: boolean
}

export const AuthorInfo: React.FC<AuthorInfoProps> = ({ 
  title = "Author Information", 
  showAvatar = true, 
  showEmail = true 
}) => {
  const [userInfo, setUserInfo] = useState<{
    name: string
    email: string
    avatar?: string
  } | null>(null)

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (user.user) {
          const userEmail = user.user.email || ''
          const userName = user.user.user_metadata?.display_name || 
                          user.user.user_metadata?.full_name || 
                          userEmail.split('@')[0] || 
                          'Anonymous Author'
          const userAvatar = user.user.user_metadata?.avatar_url || null

          setUserInfo({
            name: userName,
            email: userEmail,
            avatar: userAvatar
          })
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    }

    loadUserInfo()
  }, [])

  if (!userInfo) {
    return null
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon fontSize="small" />
        {title}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {showAvatar && (
          <Avatar 
            src={userInfo.avatar || undefined}
            sx={{ width: 40, height: 40 }}
          >
            {userInfo.name.charAt(0).toUpperCase()}
          </Avatar>
        )}
        
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {userInfo.name}
          </Typography>
          {showEmail && userInfo.email && (
            <Typography variant="body2" color="text.secondary">
              {userInfo.email}
            </Typography>
          )}
        </Box>
        
        <Chip 
          label="Article Author" 
          size="small" 
          variant="outlined" 
          color="primary"
        />
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        This information will be automatically added to articles you create
      </Typography>
    </Paper>
  )
}