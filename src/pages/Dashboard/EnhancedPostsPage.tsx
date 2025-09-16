import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Popover,
  MenuList,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  useTheme,
  alpha,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup
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
  Create as DraftIcon,
  Warning as WarningIcon,
  Image as ImageIcon,
  Description as ContentIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material'
import { PostsService } from '../../services/postsService'
import type { Post } from '../../types/database'
import { getCategoryDisplayName } from '../../constants/categories'

interface FilterState {
  status: string
  category: string
  search: string
}

export const EnhancedPostsPage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    category: '',
    search: ''
  })
  const [categories, setCategories] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'card' | 'table'>(() => {
    // Load view mode from localStorage, default to 'card'
    const savedViewMode = localStorage.getItem('posts-view-mode')
    return (savedViewMode === 'card' || savedViewMode === 'table') ? savedViewMode : 'card'
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')

  const loadPosts = async (isSearch = false) => {
    try {
      // Only show full loading on initial load, use searching state for searches
      if (isSearch) {
        setSearching(true)
      } else if (loading) {
        setLoading(true)
      }
      
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
      if (isSearch) {
        setSearching(false)
      } else {
        setLoading(false)
      }
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

  // Handle search execution
  const executeSearch = () => {
    if (searchInput !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchInput }))
      setPage(1)
    }
  }

  // Handle Enter key press
  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      executeSearch()
    }
  }

  useEffect(() => {
    const isSearching = filters.search !== ''
    loadPosts(isSearching)
  }, [page, filters])

  useEffect(() => {
    loadCategories()
  }, [])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, post: Post) => {
    event.preventDefault()
    event.stopPropagation()
    
    // Get position coordinates instead of using anchor element
    const rect = event.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    })
    setSelectedPost(post)
  }

  const handleMenuClose = () => {
    setMenuPosition(null)
    setSelectedPost(null)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPost) return
    
    try {
      await PostsService.deletePost(selectedPost.id)
      await loadPosts()
      handleMenuClose()
      setDeleteDialogOpen(false)
      
      // Show success message
      setError(null) // Clear any previous errors
      setSuccessMessage(`Successfully deleted "${selectedPost.title}" and all associated images`)
    } catch (err) {
      // Show error dialog instead of error banner
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete post and images')
      setErrorDialogOpen(true)
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false)
    setDeleteError(null)
  }

  const handleViewModeChange = (newMode: 'card' | 'table') => {
    if (newMode) {
      setViewMode(newMode)
      localStorage.setItem('posts-view-mode', newMode)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === 'search') {
      // Only update local search input, don't trigger search
      setSearchInput(value)
    } else {
      setFilters(prev => ({ ...prev, [key]: value }))
      setPage(1) // Reset to first page when filtering
    }
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
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
              id="post-action-button"
              size="small"
              aria-label="Post actions"
              aria-controls={Boolean(menuPosition) ? 'post-action-menu' : undefined}
              aria-haspopup="true"
              onClick={(e) => handleMenuClick(e, post)}
              sx={{ 
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                position: 'relative',
                zIndex: 1
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
              label={getCategoryDisplayName(post.category)} 
              size="small" 
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0, mt: 'auto' }}>
          <Box display="flex" alignItems="center" width="100%">
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main }}>
              {(post.author_email || post.author_name)?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="body2" fontWeight="medium">
                {post.author_name || post.author_email || 'Anonymous'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Typography>
            </Box>
            <Button 
              size="small" 
              startIcon={<ViewIcon />}
              onClick={() => navigate(`/dashboard/posts/view/${post.id}`)}
            >
              View
            </Button>
          </Box>
        </CardActions>
      </Card>
    </motion.div>
  )

  // List view component
  const PostListItem = ({ post, index }: { post: Post; index: number }) => (
    <TableRow
      hover
      sx={{
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.04)
        }
      }}
    >
        <TableCell sx={{ width: 100, padding: 1 }}>
          {post.cover_image_url && (
            <Box
              component="img"
              src={post.cover_image_url}
              alt={post.title}
              sx={{
                width: 60,
                height: 40,
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
          )}
        </TableCell>
        <TableCell sx={{ width: 400 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.95rem' }}>
            {post.title}
          </Typography>
          {post.excerpt && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.85rem',
                lineHeight: 1.4
              }}
            >
              {post.excerpt}
            </Typography>
          )}
        </TableCell>
        <TableCell sx={{ width: 140 }}>
          {post.category ? (
            <Chip 
              label={getCategoryDisplayName(post.category)} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          ) : (
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
              No category
            </Typography>
          )}
        </TableCell>
        <TableCell sx={{ width: 120 }}>
          <Chip
            icon={getStatusIcon(post.status)}
            label={post.status}
            color={getStatusColor(post.status)}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        </TableCell>
        <TableCell sx={{ width: 120 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: 140 }}>
          <Box display="flex" gap={1}>
            <Tooltip title="View">
              <IconButton 
                size="small"
                onClick={() => navigate(`/dashboard/posts/view/${post.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton 
                size="small"
                onClick={() => navigate(`/dashboard/posts/edit/${post.id}`)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More actions">
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, post)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
  )

  // Remove duplicate posts based on ID
  const uniquePosts = useMemo(() => {
    const seen = new Set()
    return posts.filter(post => {
      if (seen.has(post.id)) {
        return false
      }
      seen.add(post.id)
      return true
    })
  }, [posts])

  // Memoize the posts grid to prevent re-rendering when searchInput changes
  const postsGrid = useMemo(() => (
    <Grid container spacing={3}>
      {uniquePosts.map((post, index) => (
        <Grid key={post.id} size={{ xs: 12, md: 6, lg: 4 }}>
          <PostCard post={post} index={index} />
        </Grid>
      ))}
    </Grid>
  ), [uniquePosts])

  // Memoize the posts list to prevent re-rendering when searchInput changes
  const postsList = useMemo(() => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table sx={{ tableLayout: 'fixed', minWidth: 1020 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableCell sx={{ fontWeight: 600, width: 100, padding: 1 }}>Image</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 400 }}>Title & Content</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 140 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 120 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 120 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 140 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uniquePosts.map((post, index) => (
            <PostListItem key={`post-${post.id}`} post={post} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ), [uniquePosts])

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
            onClick={() => navigate('/dashboard/posts/create')}
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
            New Article
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
                placeholder="Search posts... (Press Enter to search)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searching ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SearchIcon color="action" />
                      )}
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
              <Box display="flex" justifyContent="flex-end" gap={2} alignItems="center">
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => handleViewModeChange(newMode)}
                  size="small"
                  sx={{ 
                    '& .MuiToggleButton-root': {
                      borderRadius: 1.5,
                      px: 2
                    }
                  }}
                >
                  <ToggleButton value="card">
                    <GridViewIcon fontSize="small" sx={{ mr: 1 }} />
                    Grid
                  </ToggleButton>
                  <ToggleButton value="table">
                    <ListViewIcon fontSize="small" sx={{ mr: 1 }} />
                    List
                  </ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title="Reset Filters">
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setFilters({ status: '', category: '', search: '' })
                      setSearchInput('')
                    }}
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
      <AnimatePresence>
        {uniquePosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
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
          viewMode === 'card' ? postsGrid : postsList
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

      {/* Action Menu */}
      <Popover
        id="post-action-menu"
        open={Boolean(menuPosition)}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition ? { top: menuPosition.top, left: menuPosition.left } : undefined}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '140px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)',
            mt: 1
          }
        }}
      >
        <MenuList 
          dense
          sx={{
            py: 1,
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              py: 0.75,
              px: 2,
              borderRadius: 1,
              mx: 1,
              my: 0.5
            }
          }}
        >
        <MenuItem 
          onClick={() => {
            if (selectedPost) {
              window.open(`/dashboard/posts/view/${selectedPost.id}`, '_blank')
            }
            handleMenuClose()
          }}
          sx={{ 
            py: 1, 
            px: 2,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ViewIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
          View
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedPost) {
              navigate(`/dashboard/posts/edit/${selectedPost.id}`)
            }
            handleMenuClose()
          }}
          sx={{ 
            py: 1, 
            px: 2,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteClick} 
          sx={{ 
            py: 1, 
            px: 2,
            color: 'error.main',
            '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' }
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
        </MenuList>
      </Popover>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            pb: 2,
            color: 'error.main'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.error.main, 0.1)
            }}
          >
            <WarningIcon sx={{ color: 'error.main', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Delete Post
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 0 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to permanently delete <strong>"{selectedPost?.title}"</strong>?
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            The following will be permanently removed:
          </Typography>
          
          <List dense sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2, p: 1 }}>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ContentIcon sx={{ color: 'error.main', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Post content and metadata"
                secondary="Title, content, excerpt, category, and tags"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ImageIcon sx={{ color: 'error.main', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Associated images"
                secondary="Cover image and any embedded content images"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          </List>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ 
              minWidth: 100,
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={handleErrorDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            pb: 2,
            color: 'error.main'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.error.main, 0.1)
            }}
          >
            <ErrorIcon sx={{ color: 'error.main', fontSize: 24 }} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight="bold">
              Delete Failed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unable to delete the post
            </Typography>
          </Box>
          <IconButton 
            onClick={handleErrorDialogClose}
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.text.secondary, 0.1) }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 0 }}>
          <Typography variant="body1" gutterBottom>
            We encountered an error while trying to delete <strong>"{selectedPost?.title}"</strong>.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
            Error Details:
          </Typography>
          
          <Box 
            sx={{ 
              bgcolor: alpha(theme.palette.error.main, 0.05), 
              borderRadius: 2, 
              p: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                color: 'error.dark',
                wordBreak: 'break-word'
              }}
            >
              {deleteError}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please try again in a few moments. If the problem persists, contact support.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleErrorDialogClose}
            variant="contained"
            sx={{ 
              minWidth: 100,
              borderRadius: 2
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage(null)}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}