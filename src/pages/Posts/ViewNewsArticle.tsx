import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Avatar,
  Divider,
  Grid
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Visibility as ViewsIcon,
  AccessTime as TimeIcon,
  Tag as TagIcon
} from '@mui/icons-material'
import { PostsService } from '../../services/postsService'
import type { Post } from '../../types/database'

export const ViewNewsArticle: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const postData = await PostsService.getPostById(parseInt(id))
        setPost(postData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [id])

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'publish':
        return 'success'
      case 'draft':
        return 'warning'
      case 'private':
        return 'info'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} />
      </Box>
    )
  }

  if (error || !post) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Post not found'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard/posts')}>
          Back to Posts
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Back to Posts">
              <IconButton onClick={() => navigate('/dashboard/posts')}>
                <BackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              View Article
            </Typography>
            <Chip
              label={post.status}
              color={getStatusColor(post.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/dashboard/posts/edit/${post.id}`)}
            sx={{
              background: theme.gradients?.primary || theme.palette.primary.main,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
              }
            }}
          >
            Edit Article
          </Button>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Cover Image */}
            {post.cover_image_url && (
              <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={post.cover_image_url}
                  alt={post.title}
                  sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover'
                  }}
                />
              </Paper>
            )}

            {/* Article Header */}
            <Paper sx={{ p: 4, mb: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {post.title}
              </Typography>
              
              {post.subtitle && (
                <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
                  {post.subtitle}
                </Typography>
              )}

              {/* Author & Date Info */}
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {post.author_email || post.author_name || 'Anonymous'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} color="text.secondary">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TimeIcon fontSize="small" />
                      <Typography variant="caption">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    {post.updated_at !== post.created_at && (
                      <Typography variant="caption">
                        • Updated {new Date(post.updated_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {post.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      icon={<TagIcon />}
                    />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Excerpt */}
              {post.excerpt && (
                <Typography variant="h6" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 3 }}>
                  {post.excerpt}
                </Typography>
              )}

              {/* Content */}
              <Box 
                sx={{ 
                  '& p': { mb: 2, lineHeight: 1.7 },
                  '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 3, mb: 2, fontWeight: 600 },
                  '& ul, & ol': { pl: 3, mb: 2 },
                  '& blockquote': { 
                    pl: 3, 
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    bgcolor: 'grey.50',
                    py: 2,
                    fontStyle: 'italic'
                  },
                  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2 },
                  '& pre': { 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1, 
                    overflow: 'auto',
                    fontSize: '0.875rem'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                Article Details
              </Typography>
              
              <Box sx={{ '& > *': { mb: 2 } }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={post.status}
                    color={getStatusColor(post.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {post.category && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body2">
                      {post.category}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Featured
                  </Typography>
                  <Typography variant="body2">
                    {post.featured ? 'Yes' : 'No'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Word Count
                  </Typography>
                  <Typography variant="body2">
                    ~{post.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(post.created_at).toLocaleString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body2">
                    {new Date(post.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {post.scheduled_date && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  Publishing Schedule
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Scheduled for: {new Date(post.scheduled_date).toLocaleString()}
                </Typography>
              </Paper>
            )}

            <Card sx={{ bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Quick Actions
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/dashboard/posts/edit/${post.id}`)}
                    fullWidth
                  >
                    Edit Article
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ViewsIcon />}
                    onClick={() => window.open(`/posts/${post.id}`, '_blank')}
                    fullWidth
                  >
                    View Live
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}