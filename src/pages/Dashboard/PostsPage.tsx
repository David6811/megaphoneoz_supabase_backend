import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  TablePagination
} from '@mui/material'
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { PostsService } from '../../services/postsService'
import type { Post } from '../../types/database'

export const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const loadPosts = async () => {
    try {
      setLoading(true)
      const { data, count } = await PostsService.getAllPosts(page, rowsPerPage)
      setPosts(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [page, rowsPerPage])

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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Posts Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Navigate to create post */}}
        >
          New Post
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Created</TableCell>
                <TableCell width="100">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {post.title}
                      </Typography>
                      {post.excerpt && (
                        <Typography variant="body2" color="text.secondary">
                          {post.excerpt.substring(0, 80)}...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{post.category || '-'}</TableCell>
                  <TableCell>{post.author?.email || '-'}</TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, post)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}