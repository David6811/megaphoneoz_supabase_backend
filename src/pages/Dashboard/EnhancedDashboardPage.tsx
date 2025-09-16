import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  useTheme,
  alpha
} from '@mui/material'
import {
  Article as ArticleIcon,
  Comment as CommentIcon,
  Visibility as ViewIcon,
  NotificationsActive as NotificationIcon,
  Category as CategoryIcon
} from '@mui/icons-material'
import {
  AreaChart,
  Area,
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
  totalCategories: number
}

interface Activity {
  id: string
  type: 'post' | 'comment'
  title: string
  description: string
  timestamp: string
  status?: string
  created_at: string
}

interface AnalyticsData {
  name: string
  posts: number
  comments: number
  views: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

export const EnhancedDashboardPage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalComments: 0,
    pendingComments: 0,
    drafts: 0,
    totalViews: 0,
    publishedThisWeek: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [postsResult, commentsResult, draftsResult, pendingResult, categories, recentPosts, recentComments, postsAnalytics, commentsAnalytics] = await Promise.all([
          PostsService.getAllPosts(0, 1),
          CommentsService.getAllComments(0, 1),
          PostsService.getAllPosts(0, 1, { status: 'draft' }),
          CommentsService.getAllComments(0, 1, { status: 'pending' }),
          PostsService.getCategories(),
          PostsService.getRecentPosts(3),
          CommentsService.getRecentComments(3),
          PostsService.getAnalyticsData(7),
          CommentsService.getAnalyticsData(7)
        ])

        setStats({
          totalPosts: postsResult.count || 0,
          totalComments: commentsResult.count || 0,
          drafts: draftsResult.count || 0,
          pendingComments: pendingResult.count || 0,
          totalViews: 0, // Disabled - no tracking available
          publishedThisWeek: 7, // Mock data
          totalCategories: categories.length
        })

        // Create category chart data with real categories
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1']
        const categoryChartData: CategoryData[] = await Promise.all(
          categories.map(async (category, index) => {
            const categoryPosts = await PostsService.getAllPosts(0, 1, { category })
            return {
              name: category,
              value: categoryPosts.count || 0,
              color: colors[index % colors.length]
            }
          })
        )
        
        setCategoryData(categoryChartData)

        // Combine recent posts and comments into activities
        const recentActivities: Activity[] = []
        
        // Add recent posts
        recentPosts.forEach(post => {
          recentActivities.push({
            id: `post-${post.id}`,
            type: 'post',
            title: post.status === 'publish' ? 'Post published' : post.status === 'draft' ? 'Draft saved' : 'Post updated',
            description: `"${post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title}"`,
            timestamp: formatTimestamp(post.created_at),
            status: post.status,
            created_at: post.created_at
          })
        })

        // Add recent comments
        recentComments.forEach(comment => {
          const postTitle = comment.posts?.title || 'Unknown post'
          recentActivities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            title: comment.status === 'pending' ? 'New comment awaiting approval' : 'Comment posted',
            description: `Comment on "${postTitle.length > 30 ? postTitle.substring(0, 30) + '...' : postTitle}"`,
            timestamp: formatTimestamp(comment.created_at),
            status: comment.status,
            created_at: comment.created_at
          })
        })

        // Sort activities by created_at date (most recent first) and take top 6
        const sortedActivities = recentActivities
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6)
          
        setActivities(sortedActivities)

        // Merge posts and comments analytics data
        const mergedAnalytics: AnalyticsData[] = postsAnalytics.map(postDay => {
          const commentDay = commentsAnalytics.find(c => c.date === postDay.date)
          return {
            name: postDay.name,
            posts: postDay.posts,
            comments: commentDay?.comments || 0,
            views: Math.max(postDay.posts * 50, commentDay?.comments ? commentDay.comments * 20 : 0) // Estimated views based on engagement
          }
        })
        
        setAnalyticsData(mergedAnalytics)
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const StatCard = ({ title, value, icon, color, gradient, trend, disabled }: {
    title: string
    value: number
    icon: React.ReactNode
    color: string
    gradient: string
    trend?: number
    disabled?: boolean
  }) => (
    <motion.div
      whileHover={disabled ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: disabled ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)' : gradient,
          color: disabled ? '#757575' : 'white',
          position: 'relative',
          overflow: 'hidden',
          opacity: disabled ? 0.7 : 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: disabled ? 'rgba(117, 117, 117, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(30px, -30px)'
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ 
              bgcolor: disabled ? 'rgba(117, 117, 117, 0.2)' : 'rgba(255, 255, 255, 0.2)', 
              color: disabled ? '#757575' : color 
            }}>
              {icon}
            </Avatar>
            {trend && !disabled && (
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
      case 'publish':
      case 'published':
      case 'approved':
        return theme.palette.success.main
      case 'pending':
        return theme.palette.warning.main
      case 'draft':
        return theme.palette.info.main
      case 'spam':
        return theme.palette.error.main
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
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Comments"
            value={stats.totalComments}
            icon={<CommentIcon />}
            color="#f093fb"
            gradient={theme.gradients.secondary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Views"
            value={0}
            icon={<ViewIcon />}
            color="#4facfe"
            gradient={theme.gradients.success}
            disabled={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Content Categories"
            value={stats.totalCategories}
            icon={<CategoryIcon />}
            color="#ffecd2"
            gradient={theme.gradients.warning}
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
                Content & Engagement Analytics (Last 7 Days)
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                  <CircularProgress />
                </Box>
              ) : analyticsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={analyticsData}>
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
                    <Tooltip formatter={(value, name) => [
                      value,
                      name === 'posts' ? 'Posts Created' : 
                      name === 'comments' ? 'Comments Added' : 
                      name === 'views' ? 'Estimated Views' : name
                    ]} />
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
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No analytics data available
                  </Typography>
                </Box>
              )}
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
                Content Categories Distribution
              </Typography>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} posts`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading ? <CircularProgress size={20} /> : 'No categories found'}
                  </Typography>
                </Box>
              )}
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
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : activities.length > 0 ? (
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
                              activity.status === 'publish' ? 'success' :
                              activity.status === 'pending' ? 'warning' : 
                              activity.status === 'approved' ? 'success' : 'info'
                            }
                          />
                        )}
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activity found
                  </Typography>
                </Box>
              )}
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
                  onClick={() => navigate('/dashboard/posts/create')}
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
                  onClick={() => navigate('/dashboard/comments')}
                  sx={{ py: 1.5 }}
                >
                  Moderate Comments ({stats.pendingComments})
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArticleIcon />}
                  fullWidth
                  onClick={() => navigate('/dashboard/posts')}
                  sx={{ py: 1.5 }}
                >
                  Manage Posts
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}