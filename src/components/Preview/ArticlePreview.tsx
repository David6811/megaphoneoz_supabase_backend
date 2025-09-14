import React from 'react'
import {
  Box,
  Typography,
  Chip,
  Paper,
  Avatar,
  Divider,
  useTheme
} from '@mui/material'
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Category as CategoryIcon
} from '@mui/icons-material'

interface ArticlePreviewProps {
  headline: string
  subheadline: string
  byline: string
  category: string
  tags: string[]
  content: string
  excerpt: string
  coverImage: string
  featured: boolean
  breaking: boolean
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  headline,
  subheadline,
  byline,
  category,
  tags,
  content,
  coverImage,
  featured,
  breaking
}) => {
  const theme = useTheme()
  
  const wordCount = content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length
  const readingTime = Math.ceil(wordCount / 200)
  const publishDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto',
        background: theme.palette.background.paper,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      {/* Header with breaking/featured indicators */}
      {(breaking || featured) && (
        <Box sx={{ p: 2, pb: 0 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {breaking && (
              <Chip
                label="BREAKING NEWS"
                color="error"
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              />
            )}
            {featured && (
              <Chip
                label="FEATURED"
                color="primary"
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Cover Image */}
      {coverImage && (
        <Box
          sx={{
            width: '100%',
            height: 300,
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            m: 2,
            mr: 2,
            ml: 2,
            borderRadius: 1
          }}
        />
      )}

      {/* Article Content */}
      <Box sx={{ p: 3 }}>
        {/* Category */}
        {category && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CategoryIcon fontSize="small" color="primary" />
            <Typography 
              variant="overline" 
              color="primary"
              sx={{ 
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase'
              }}
            >
              {category}
            </Typography>
          </Box>
        )}

        {/* Headline */}
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            fontWeight: 800,
            lineHeight: 1.1,
            mb: 2,
            color: theme.palette.text.primary,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
          }}
        >
          {headline || 'Article Headline'}
        </Typography>

        {/* Subheadline */}
        {subheadline && (
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              fontWeight: 400,
              lineHeight: 1.4,
              mb: 3,
              fontStyle: 'italic'
            }}
          >
            {subheadline}
          </Typography>
        )}

        {/* Author and Meta Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {byline || 'Author Name'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {publishDate}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {readingTime} min read
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Article Content */}
        <Box 
          sx={{ 
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              fontWeight: 700,
              mb: 2.5,
              mt: 4,
              color: theme.palette.text.primary,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              '&:first-of-type': { mt: 0 }
            },
            '& h1': { fontSize: '2rem' },
            '& h2': { fontSize: '1.6rem' },
            '& h3': { fontSize: '1.3rem' },
            '& p': {
              mb: 2.5,
              lineHeight: 1.8,
              fontSize: '1.125rem',
              color: theme.palette.text.primary,
              fontFamily: 'Georgia, "Times New Roman", Times, serif',
              textAlign: 'justify'
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 2,
              my: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            },
            '& ul, & ol': {
              mb: 3,
              pl: 3,
              '& li': {
                mb: 1.5,
                lineHeight: 1.7,
                fontSize: '1.125rem',
                fontFamily: 'Georgia, "Times New Roman", Times, serif'
              }
            },
            '& blockquote': {
              borderLeft: `5px solid ${theme.palette.primary.main}`,
              pl: 3,
              py: 2,
              my: 3,
              fontStyle: 'italic',
              fontSize: '1.2rem',
              backgroundColor: theme.palette.action.hover,
              borderRadius: 2,
              '& p': {
                fontSize: '1.2rem',
                fontWeight: 500
              }
            },
            '& strong': {
              fontWeight: 700
            },
            '& em': {
              fontStyle: 'italic'
            },
            '& a': {
              color: theme.palette.primary.main,
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none'
              }
            }
          }}
          dangerouslySetInnerHTML={{ __html: content || '<p style="color: #666; font-style: italic;">Start writing your article content to see the preview...</p>' }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: 'lowercase' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}