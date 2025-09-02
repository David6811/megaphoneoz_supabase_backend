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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  TablePagination
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Check as ApproveIcon,
  Block as RejectIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon
} from '@mui/icons-material'
import { CommentsService } from '../../services/commentsService'
import type { Comment } from '../../types/database'

export const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const loadComments = async () => {
    try {
      setLoading(true)
      const { data, count } = await CommentsService.getAllComments(page, rowsPerPage)
      setComments(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [page, rowsPerPage])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setAnchorEl(event.currentTarget)
    setSelectedComment(comment)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedComment(null)
  }

  const handleApprove = async () => {
    if (!selectedComment) return
    
    try {
      await CommentsService.approveComment(selectedComment.id)
      await loadComments()
      handleMenuClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve comment')
    }
  }

  const handleReject = async () => {
    if (!selectedComment) return
    
    try {
      await CommentsService.rejectComment(selectedComment.id)
      await loadComments()
      handleMenuClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject comment')
    }
  }

  const handleDelete = async () => {
    if (!selectedComment) return
    
    try {
      await CommentsService.deleteComment(selectedComment.id)
      await loadComments()
      handleMenuClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getStatusColor = (status: Comment['status']) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'spam':
        return 'error'
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
        <Typography variant="h4">Comments Management</Typography>
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
                <TableCell>Comment</TableCell>
                <TableCell>Post</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell width="100">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {comment.content.substring(0, 100)}
                      {comment.content.length > 100 && '...'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {comment.post?.title || `Post #${comment.post_id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {comment.user?.email || comment.author_name || 'Anonymous'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={comment.status}
                      color={getStatusColor(comment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, comment)}
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
        {selectedComment?.status !== 'approved' && (
          <MenuItem onClick={handleApprove}>
            <ApproveIcon sx={{ mr: 1 }} />
            Approve
          </MenuItem>
        )}
        {selectedComment?.status !== 'spam' && (
          <MenuItem onClick={handleReject}>
            <RejectIcon sx={{ mr: 1 }} />
            Reject
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ReplyIcon sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}