import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Grid,
  ListSubheader
} from '@mui/material'
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Preview as PreviewIcon,
  ArrowBack as BackIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Title as TitleIcon
} from '@mui/icons-material'
import { RichTextEditor } from '../../components/Editor/RichTextEditor'
import { ImageUpload } from '../../components/Upload/ImageUpload'
import { ArticlePreview } from '../../components/Preview/ArticlePreview'
import { PostsService } from '../../services/postsService'
import { StorageService, UploadResult } from '../../services/storageService'
import { NEWS_CATEGORIES, STANDALONE_CATEGORIES } from '../../constants/categories'
import type { Post } from '../../types/database'

interface NewsFormData {
  headline: string
  subheadline: string
  byline: string
  category: string
  tags: string[]
  content: string
  excerpt: string
  coverImage: string
  status: 'draft' | 'publish' | 'private' | 'scheduled'
  featured: boolean
  scheduledDate?: Date | null
}

export const EditNewsArticle: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })
  
  const [formData, setFormData] = useState<NewsFormData>({
    headline: '',
    subheadline: '',
    byline: '',
    category: '',
    tags: [],
    content: '',
    excerpt: '',
    coverImage: '',
    status: 'draft',
    featured: false,
    scheduledDate: null
  })


  const [tagInput, setTagInput] = useState('')

  // Load existing post data
  useEffect(() => {
    const loadPost = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const post = await PostsService.getPostById(parseInt(id))
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Loaded post data:', post) // Debug log
        }
        
        if (post) {
          // Handle fields that may not exist in database yet
          const formData = {
            headline: post.title || '',
            subheadline: (post as any).subtitle || '', // May not exist yet
            byline: post.author_name || post.author_email || '',
            category: post.category || '',
            tags: Array.isArray((post as any).tags) ? (post as any).tags : [], // May not exist yet
            content: post.content || '',
            excerpt: post.excerpt || '',
            coverImage: post.cover_image_url || '',
            status: post.status || 'draft',
            featured: Boolean((post as any).featured), // May not exist yet
            scheduledDate: (post as any).scheduled_date ? new Date((post as any).scheduled_date) : null // May not exist yet
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Setting form data:', formData) // Debug
          }
          setFormData(formData)
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load post',
          severity: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [id])

  const handleInputChange = (field: keyof NewsFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        handleInputChange('tags', [...formData.tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleImageUpload = (results: UploadResult[]) => {
    if (results.length > 0) {
      handleInputChange('coverImage', results[0].url)
    }
  }

  const handleSave = async (status: 'draft' | 'publish' | 'private' = 'draft') => {
    if (!id) return
    
    try {
      setSaving(true)
      
      // Only send fields that exist in the database
      const updateData: any = {
        title: formData.headline,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        cover_image_url: formData.coverImage,
        status
      }
      
      // Only add optional fields if they're supported
      if (formData.subheadline) {
        updateData.subtitle = formData.subheadline
      }
      if (formData.tags && formData.tags.length > 0) {
        updateData.tags = formData.tags
      }
      if (formData.featured) {
        updateData.featured = formData.featured
      }
      if (formData.scheduledDate) {
        updateData.scheduled_date = formData.scheduledDate.toISOString()
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Updating with data:', updateData) // Debug
      }
      await PostsService.updatePost(parseInt(id), updateData)

      setSnackbar({
        open: true,
        message: status === 'publish' ? 'Article published successfully!' : 'Article saved successfully!',
        severity: 'success'
      })

      // Navigate back after successful save
      setTimeout(() => {
        navigate('/dashboard/posts')
      }, 1500)

    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save article',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const isFormValid = formData.headline.trim() && formData.content.trim()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} />
      </Box>
    )
  }

  if (showPreview) {
    return (
      <ArticlePreview
        headline={formData.headline}
        subheadline={formData.subheadline}
        byline={formData.byline}
        category={formData.category}
        tags={formData.tags}
        content={formData.content}
        excerpt={formData.excerpt}
        coverImage={formData.coverImage}
        featured={formData.featured}
        breaking={false}
        onClose={() => setShowPreview(false)}
      />
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
              Edit Article
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(true)}
              disabled={!isFormValid}
            >
              Preview
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => handleSave('draft')}
              disabled={saving || !isFormValid}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={() => handleSave('publish')}
              disabled={saving || !isFormValid}
              sx={{
                background: theme.gradients?.primary || theme.palette.primary.main,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
                }
              }}
            >
              {saving ? 'Updating...' : 'Update'}
            </Button>
          </Box>
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
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TitleIcon color="primary" />
                Article Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Headline"
                    value={formData.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    placeholder="Enter a compelling headline..."
                    sx={{ mb: 2 }}
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Subheadline"
                    value={formData.subheadline}
                    onChange={(e) => handleInputChange('subheadline', e.target.value)}
                    placeholder="Optional subheadline for more context..."
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Byline"
                    value={formData.byline}
                    onChange={(e) => handleInputChange('byline', e.target.value)}
                    placeholder="Author name"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {[
                        // Three-tier hierarchical categories
                        ...Object.entries(NEWS_CATEGORIES).map(([level1, level2Obj]) => [
                          <ListSubheader key={level1} sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1rem' }}>
                            {level1}
                          </ListSubheader>,
                          ...Object.entries(level2Obj).map(([level2, level3Array]) => {
                            if (level3Array.length === 0) {
                              // Level 2 only - can be selected directly
                              return (
                                <MenuItem key={`${level1} > ${level2}`} value={`${level1} > ${level2}`} sx={{ pl: 3, fontWeight: 500 }}>
                                  {level2}
                                </MenuItem>
                              )
                            } else {
                              // Level 2 has Level 3 children
                              return [
                                <ListSubheader key={`${level1}-${level2}`} sx={{ fontWeight: 500, color: 'text.secondary', pl: 2, fontSize: '0.9rem' }}>
                                  {level2}
                                </ListSubheader>,
                                ...level3Array.map(level3 => (
                                  <MenuItem key={`${level1} > ${level2} > ${level3}`} value={`${level1} > ${level2} > ${level3}`} sx={{ pl: 6 }}>
                                    {level3}
                                  </MenuItem>
                                ))
                              ]
                            }
                          })
                        ]),
                        // Standalone categories
                        ...STANDALONE_CATEGORIES.map(category => (
                          <MenuItem key={category} value={category} sx={{ fontWeight: 500 }}>
                            {category}
                          </MenuItem>
                        ))
                      ]}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tags and press Enter..."
                    helperText="Press Enter to add tags"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content
              </Typography>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Start writing your article..."
              />
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Excerpt
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Write a brief summary of your article..."
                helperText="This will be used in article previews and social media"
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
              <Typography variant="h6" gutterBottom>
                Cover Image
              </Typography>
              <ImageUpload
                onUpload={handleImageUpload}
                maxFiles={1}
                existingImages={formData.coverImage ? [{
                  url: formData.coverImage,
                  path: '',
                  fileName: 'cover-image'
                }] : []}
              />
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Publishing Options
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="publish">Published</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                }
                label="Featured Article"
                sx={{ mb: 2 }}
              />
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                Article Info
              </Typography>
              
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Category:</strong> {formData.category || 'Not selected'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Tags:</strong> {formData.tags.length} tags
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Word Count:</strong> ~{formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}