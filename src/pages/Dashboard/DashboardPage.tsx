import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress
} from '@mui/material'
import {
  Article as ArticleIcon,
  Comment as CommentIcon
} from '@mui/icons-material'
import { PostsService } from '../../services/postsService'
import { CommentsService } from '../../services/commentsService'

interface DashboardStats {
  totalPosts: number
  totalComments: number
  pendingComments: number
  drafts: number
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalComments: 0,
    pendingComments: 0,
    drafts: 0
  })
  const [loading, setLoading] = useState(true)

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
          pendingComments: pendingResult.count || 0
        })
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const StatCard = ({ title, value, icon, color }: {
    title: string
    value: number
    icon: React.ReactNode
    color: string
  }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<ArticleIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Comments"
            value={stats.totalComments}
            icon={<CommentIcon fontSize="large" />}
            color="#388e3c"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Comments"
            value={stats.pendingComments}
            icon={<CommentIcon fontSize="large" />}
            color="#f57c00"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Draft Posts"
            value={stats.drafts}
            icon={<ArticleIcon fontSize="large" />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography color="textSecondary">
              Activity tracking will be implemented in future updates.
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 1 }}
                startIcon={<ArticleIcon />}
              >
                New Post
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CommentIcon />}
              >
                Moderate Comments
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}