import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material'
import {
  Article as ArticleIcon,
  Comment as CommentIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  NotificationsActive as NotificationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { PostsService } from '../../services/postsService'
import { CommentsService } from '../../services/commentsService'

interface DashboardStats {
  totalPosts: number
  totalComments: number
  pendingComments: number
  drafts: number
  totalViews: number
  publishedThisWeek: number
}

interface Activity {
  id: string
  type: 'post' | 'comment' | 'user'
  title: string
  description: string
  timestamp: string
  status?: string
}

const mockAnalyticsData = [
  { name: 'Mon', posts: 4, comments: 12, views: 240 },
  { name: 'Tue', posts: 3, comments: 8, views: 180 },
  { name: 'Wed', posts: 6, comments: 15, views: 320 },
  { name: 'Thu', posts: 2, comments: 6, views: 150 },
  { name: 'Fri', posts: 5, comments: 18, views: 280 },
  { name: 'Sat', posts: 7, comments: 22, views: 380 },
  { name: 'Sun', posts: 4, comments: 14, views: 220 }
]

const categoryData = [
  { name: 'Technology', value: 35, color: '#8884d8' },
  { name: 'Design', value: 25, color: '#82ca9d' },
  { name: 'Marketing', value: 20, color: '#ffc658' },
  { name: 'Business', value: 15, color: '#ff7300' },
  { name: 'Other', value: 5, color: '#00ff88' }
]

export const EnhancedDashboardPage: React.FC = () => {
  const theme = useTheme()
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalComments: 0,
    pendingComments: 0,
    drafts: 0,
    totalViews: 0,
    publishedThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'post',
      title: 'New post published',
      description: '"Building Modern Web Applications" is now live',
      timestamp: '2 minutes ago',
      status: 'published'
    },
    {
      id: '2',
      type: 'comment',
      title: 'New comment awaiting approval',
      description: 'Comment on "React Best Practices"',
      timestamp: '15 minutes ago',
      status: 'pending'
    },
    {
      id: '3',
      type: 'post',
      title: 'Draft saved',
      description: '"Advanced TypeScript Patterns" draft updated',
      timestamp: '1 hour ago',
      status: 'draft'
    }
  ])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [postsResult, commentsResult, draftsResult, pendingResult] = await Promise.all([
          PostsService.getAllPosts(0, 1),
          CommentsService.getAllComments(0, 1),
          PostsService.getAllPosts(0, 1, { status: 'draft' }),
          CommentsService.getAllComments(0, 1, { status: 'pending' })
        ])

        setStats({
          totalPosts: postsResult.count || 0,
          totalComments: commentsResult.count || 0,
          drafts: draftsResult.count || 0,
          pendingComments: pendingResult.count || 0,
          totalViews: 12340, // Mock data
          publishedThisWeek: 7 // Mock data
        })
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const StatCard = ({ title, value, icon, color, gradient, trend }: {
    title: string
    value: number
    icon: React.ReactNode
    color: string
    gradient: string
    trend?: number
  }) => (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: gradient,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(30px, -30px)'
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color }}>
              {icon}
            </Avatar>
            {trend && (
              <Chip
                size="small"
                label={`+${trend}%`}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            )}
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: '1.5rem' }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : value.toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'post':
        return <ArticleIcon />
      case 'comment':
        return <CommentIcon />
      default:
        return <NotificationIcon />
    }
  }

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'published':
        return theme.palette.success.main
      case 'pending':
        return theme.palette.warning.main
      case 'draft':
        return theme.palette.info.main
      default:
        return theme.palette.primary.main
    }
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Dashboard Overview
        </Typography>
      </motion.div>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<ArticleIcon />}
            color="#667eea"
            gradient={theme.gradients.primary}
            trend={12}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Comments"
            value={stats.totalComments}
            icon={<CommentIcon />}
            color="#f093fb"
            gradient={theme.gradients.secondary}
            trend={8}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={<ViewIcon />}
            color="#4facfe"
            gradient={theme.gradients.success}
            trend={15}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="This Week"
            value={stats.publishedThisWeek}
            icon={<TrendingUpIcon />}
            color="#ffecd2"
            gradient={theme.gradients.warning}
            trend={5}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ p: 2.5, height: 380 }}>
              <Typography variant="h6" gutterBottom fontWeight="600" sx={{ fontSize: '0.9375rem', mb: 2 }}>
                Content & Engagement Analytics
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={mockAnalyticsData}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="posts"
                    stroke="#667eea"
                    fillOpacity={1}
                    fill="url(#colorPosts)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="comments"
                    stroke="#f093fb"
                    fillOpacity={1}
                    fill="url(#colorComments)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Content Categories
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Activity and Quick Actions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
              </Typography>
              <List>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getActivityColor(activity.status) }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      {activity.status && (
                        <Chip
                          size="small"
                          label={activity.status}
                          color={
                            activity.status === 'published' ? 'success' :
                            activity.status === 'pending' ? 'warning' : 'info'
                          }
                        />
                      )}
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Paper>
          </motion.div>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ArticleIcon />}
                  fullWidth
                  sx={{
                    background: theme.gradients.primary,
                    py: 1.5,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
                    }
                  }}
                >
                  Create New Post
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CommentIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Moderate Comments ({stats.pendingComments})
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PeopleIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ScheduleIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Schedule Content
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}