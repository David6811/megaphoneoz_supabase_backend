import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
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
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
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
import { AuthorInfo } from '../../components/User/AuthorInfo'
import { PostsService } from '../../services/postsService'
import { StorageService, UploadResult } from '../../services/storageService'
import { CATEGORY_MAP, CategoryInfo, debugCategoryMapping, getAllCategoryMappings } from '../../constants/categoryMapping'

interface NewsFormData {
  headline: string
  category: string
  tags: string[]
  content: string
  excerpt: string
  coverImage: string
  status: 'draft' | 'publish' | 'private' | 'scheduled'
  publishDate: string
  featured: boolean
  breaking: boolean
}


const NEWS_TAGS = [
  'urgent', 'exclusive', 'investigation', 'interview', 'analysis', 'breaking',
  'update', 'developing', 'trending', 'viral', 'controversy', 'scandal'
]

// Helper function to organize categories by hierarchy
const organizeCategoriesByHierarchy = () => {
  const level1Categories = Object.values(CATEGORY_MAP).filter(cat => cat.level === 1)
  const level2Categories = Object.values(CATEGORY_MAP).filter(cat => cat.level === 2)
  const level3Categories = Object.values(CATEGORY_MAP).filter(cat => cat.level === 3)
  
  return level1Categories.map(level1 => ({
    ...level1,
    children: level2Categories.filter(level2 => level2.parentId === level1.id).map(level2 => ({
      ...level2,
      children: level3Categories.filter(level3 => level3.parentId === level2.id)
    }))
  }))
}

export const CreateNewsArticle: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  
  const [formData, setFormData] = useState<NewsFormData>({
    headline: '',
    category: '',
    tags: [],
    content: '',
    excerpt: '',
    coverImage: '',
    status: 'draft',
    publishDate: new Date().toISOString().slice(0, 16),
    featured: false,
    breaking: false
  })

  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    type: 'success' | 'error'
  }>({
    open: false,
    message: '',
    type: 'success'
  })

  // Initialize Storage on component mount
  useEffect(() => {
    StorageService.initializeBucket()
    
    // 调试：显示分类映射信息
    console.log('🔧 分类映射调试工具已加载')
    debugCategoryMapping()
    
    // 将调试函数添加到全局，供前端团队使用
    ;(window as any).megaphoneCategoryDebug = {
      debugMapping: debugCategoryMapping,
      getAllMappings: getAllCategoryMappings,
      testPath: (path: string) => {
        const mappings = getAllCategoryMappings()
        console.log(`测试路径 "${path}":`, mappings[path] || '未找到映射')
        return mappings[path]
      }
    }
  }, [])

  // Auto-generate excerpt from content
  useEffect(() => {
    if (formData.content && !formData.excerpt) {
      const textContent = formData.content.replace(/<[^>]*>/g, '') // Strip HTML
      const excerpt = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')
      setFormData(prev => ({ ...prev, excerpt }))
    }
  }, [formData.content, formData.excerpt])

  const handleInputChange = (field: keyof NewsFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target ? event.target.value : event
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleCoverImageUpload = (results: UploadResult[]) => {
    if (results.length > 0) {
      setFormData(prev => ({ ...prev, coverImage: results[0].url }))
    }
  }

  const handleSave = async (publishNow = false) => {
    try {
      setSaving(true)

      const postData = {
        title: formData.headline,
        // Note: subtitle field not supported in current database schema
        content: formData.content,
        excerpt: formData.excerpt,
        status: publishNow ? 'publish' as const : formData.status,
        post_type: 'post' as const,
        cover_image_url: formData.coverImage,
        category: formData.category,
        // Additional metadata can be stored in a JSON field if available
      }

      // 调试：显示即将保存的分类
      console.log('🔍 即将保存的分类:', formData.category)
      console.log('📝 完整文章数据:', postData)

      await PostsService.createPost(postData)

      setNotification({
        open: true,
        message: publishNow ? 'Article published successfully!' : 'Article saved as draft!',
        type: 'success'
      })

      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard/posts')
      }, 2000)

    } catch (error) {
      console.error('Failed to save article:', error)
      setNotification({
        open: true,
        message: 'Failed to save article. Please try again.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const validateForm = () => {
    return formData.headline.trim() && formData.content.trim() && formData.category
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Back to Posts">
              <IconButton onClick={() => navigate('/dashboard/posts')}>
                <BackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Create News Article
            </Typography>
            {formData.breaking && (
              <Chip
                label="BREAKING"
                color="error"
                size="small"
                sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }}
              />
            )}
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewMode(!previewMode)}
              size="small"
              color={previewMode ? 'primary' : 'inherit'}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => handleSave(false)}
              disabled={!validateForm() || saving}
              size="small"
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={() => handleSave(true)}
              disabled={!validateForm() || saving}
              size="small"
              sx={{
                background: theme.gradients.primary,
                '&:hover': {
                  background: theme.gradients.primary,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Publish Now
            </Button>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {previewMode ? (
              <ArticlePreview
                headline={formData.headline}
                subheadline=""
                category={formData.category}
                tags={formData.tags}
                content={formData.content}
                excerpt={formData.excerpt}
                coverImage={formData.coverImage}
                featured={formData.featured}
                breaking={formData.breaking}
              />
            ) : (
              <Paper sx={{ p: 3, mb: 3 }}>
                {/* Headline */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TitleIcon fontSize="small" />
                    Article Headline
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter compelling headline..."
                    value={formData.headline}
                    onChange={handleInputChange('headline')}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        lineHeight: 1.3
                      }
                    }}
                  />
                </Box>


                {/* Cover Image */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Featured Image
                  </Typography>
                  <ImageUpload
                    onUpload={handleCoverImageUpload}
                    maxFiles={1}
                    existingImages={formData.coverImage ? [{
                      url: formData.coverImage,
                      path: '',
                      fileName: 'cover-image'
                    }] : []}
                  />
                </Box>

                {/* Content Editor */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Article Content
                  </Typography>
                  <RichTextEditor
                    content={formData.content}
                    onChange={handleInputChange('content')}
                    placeholder="Write your news article here. Use the toolbar to format text, add images, and structure your content..."
                  />
                </Box>
              </Paper>
            )}
          </motion.div>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Author Information */}
            <AuthorInfo />

            {/* Publication Settings */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" />
                  Publication
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="publish">Publish Now</MenuItem>
                    <MenuItem value="scheduled">Schedule</MenuItem>
                  </Select>
                </FormControl>

                {formData.status === 'scheduled' && (
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Publish Date"
                    value={formData.publishDate}
                    onChange={handleInputChange('publishDate')}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                    }
                    label="Featured Article"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.breaking}
                        onChange={(e) => setFormData(prev => ({ ...prev, breaking: e.target.checked }))}
                        color="error"
                      />
                    }
                    label="Breaking News"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* News Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon fontSize="small" />
                  News Details
                </Typography>


                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    label="Category"
                  >
                    {organizeCategoriesByHierarchy().map(level1 => [
                      <ListSubheader key={level1.id} sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1rem' }}>
                        {level1.displayName}
                      </ListSubheader>,
                      ...level1.children.map(level2 => {
                        if (level2.children.length === 0) {
                          // Level 2 only - can be selected directly
                          return (
                            <MenuItem key={level2.id} value={level2.displayName} sx={{ pl: 3, fontWeight: 500 }}>
                              {level2.displayName}
                            </MenuItem>
                          )
                        } else {
                          // Level 2 has Level 3 children
                          return [
                            <ListSubheader key={`${level2.id}-header`} sx={{ fontWeight: 500, color: 'text.secondary', pl: 2, fontSize: '0.9rem' }}>
                              {level2.displayName}
                            </ListSubheader>,
                            ...level2.children.map(level3 => (
                              <MenuItem key={level3.id} value={level3.displayName} sx={{ pl: 6 }}>
                                {level3.displayName}
                              </MenuItem>
                            ))
                          ]
                        }
                      })
                    ])}
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {NEWS_TAGS.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant={formData.tags.includes(tag) ? 'filled' : 'outlined'}
                      onClick={() => formData.tags.includes(tag) ? handleTagRemove(tag) : handleTagAdd(tag)}
                      color={formData.tags.includes(tag) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>

                <TextField
                  fullWidth
                  label="Excerpt"
                  multiline
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleInputChange('excerpt')}
                  placeholder="Brief summary of the article..."
                  helperText={`${formData.excerpt.length}/200 characters`}
                  inputProps={{ maxLength: 200 }}
                />
              </CardContent>
            </Card>

            {/* Article Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Article Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Word Count: {formData.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reading Time: ~{Math.ceil(formData.content.replace(/<[^>]*>/g, '').split(' ').length / 200)} min
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Characters: {formData.content.replace(/<[^>]*>/g, '').length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Box>
  )
}