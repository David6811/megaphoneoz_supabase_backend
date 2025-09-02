import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Fab,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Pagination,
  useTheme,
  alpha
} from '@mui/material'
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Article as ArticleIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon,
  Create as DraftIcon
} from '@mui/icons-material'
import { PostsService } from '../../services/postsService'
import type { Post } from '../../types/database'

interface FilterState {
  status: string
  category: string
  search: string
}

export const EnhancedPostsPage: React.FC = () => {
  const theme = useTheme()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    category: '',
    search: ''
  })
  const [categories, setCategories] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  const loadPosts = async () => {
    try {
      setLoading(true)
      const { data, count } = await PostsService.getAllPosts(
        page - 1, 
        12, 
        {
          status: filters.status || undefined,
          category: filters.category || undefined,
          search: filters.search || undefined
        }
      )
      setPosts(data || [])
      setTotalPages(Math.ceil((count || 0) / 12))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const categories = await PostsService.getCategories()
      setCategories(categories)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [page, filters])

  useEffect(() => {
    loadCategories()
  }, [])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, post: Post) => {
    setAnchorEl(event.currentTarget)
    setSelectedPost(post)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedPost(null)
  }

  const handleDelete = async () => {
    if (!selectedPost) return
    
    try {
      await PostsService.deletePost(selectedPost.id)
      await loadPosts()
      handleMenuClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filtering
  }

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

  const getStatusIcon = (status: Post['status']) => {
    switch (status) {
      case 'publish':
        return <PublicIcon fontSize="small" />
      case 'draft':
        return <DraftIcon fontSize="small" />
      case 'private':
        return <ScheduleIcon fontSize="small" />
      default:
        return <ArticleIcon fontSize="small" />
    }
  }

  const PostCard = ({ post, index }: { post: Post; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`
          }
        }}
      >
        {post.cover_image_url && (
          <Box
            component="img"
            src={post.cover_image_url}
            alt={post.title}
            sx={{
              height: 200,
              objectFit: 'cover',
              borderRadius: '16px 16px 0 0'
            }}
          />
        )}
        
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Chip
              icon={getStatusIcon(post.status)}
              label={post.status}
              color={getStatusColor(post.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, post)}
              sx={{ 
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
            mb: 1
          }}>
            {post.title}
          </Typography>

          {post.excerpt && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
                mb: 2
              }}
            >
              {post.excerpt}
            </Typography>
          )}

          {post.category && (
            <Chip 
              label={post.category} 
              size="small" 
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0, mt: 'auto' }}>
          <Box display="flex" alignItems="center" width="100%">
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main }}>
              {post.author?.email?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="body2" fontWeight="medium">
                {post.author?.email || 'Anonymous'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Typography>
            </Box>
            <Button size="small" startIcon={<ViewIcon />}>
              View
            </Button>
          </Box>
        </CardActions>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} />
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
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Content Management
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{
              background: theme.gradients.primary,
              px: 3,
              py: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
              }
            }}
          >
            New Post
          </Button>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 2.5, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="publish">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Tooltip title="Reset Filters">
                  <Button 
                    variant="outlined" 
                    onClick={() => setFilters({ status: '', category: '', search: '' })}
                    disabled={!filters.status && !filters.category && !filters.search}
                  >
                    Clear
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Posts Grid */}
      <AnimatePresence mode="wait">
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <ArticleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No posts found
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                {filters.search || filters.status || filters.category
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first post.'}
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Create New Post
              </Button>
            </Paper>
          </motion.div>
        ) : (
          <Grid container spacing={3}>
            {posts.map((post, index) => (
              <Grid key={post.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <PostCard post={post} index={index} />
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: theme.gradients.primary,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}