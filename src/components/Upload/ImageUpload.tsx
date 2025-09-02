import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Card,
  CardMedia,
  CardActions
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import { StorageService, UploadResult } from '../../services/storageService'

interface ImageUploadProps {
  onUpload: (results: UploadResult[]) => void
  onRemove?: (result: UploadResult) => void
  maxFiles?: number
  maxSize?: number
  existingImages?: UploadResult[]
  accept?: string[]
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  existingImages = [],
  accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}) => {
  const theme = useTheme()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>(existingImages)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedImages.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const results: UploadResult[] = []
      
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        // Compress image if needed
        const compressedFile = await StorageService.compressImage(file)
        
        // Upload to Supabase Storage
        const result = await StorageService.uploadImage(compressedFile, 'news-covers')
        results.push(result)
        
        // Update progress
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
      }

      setUploadedImages(prev => [...prev, ...results])
      onUpload(results)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [uploadedImages.length, maxFiles, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': accept.map(type => type.replace('image/', '.'))
    },
    maxSize,
    maxFiles: maxFiles - uploadedImages.length,
    disabled: uploading
  })

  const handleRemoveImage = async (image: UploadResult, index: number) => {
    try {
      await StorageService.deleteImage(image.path)
      const newImages = uploadedImages.filter((_, i) => i !== index)
      setUploadedImages(newImages)
      onRemove?.(image)
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  return (
    <Box>
      {/* Upload Area */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? theme.palette.primary.main : alpha(theme.palette.divider, 0.3)}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragActive 
              ? alpha(theme.palette.primary.main, 0.05)
              : alpha(theme.palette.background.paper, 0.8),
            transition: 'all 0.3s ease',
            position: 'relative',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            }
          }}
        >
          <input {...getInputProps()} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UploadIcon
              sx={{
                fontSize: 48,
                color: isDragActive ? theme.palette.primary.main : theme.palette.text.secondary,
                mb: 2
              }}
            />
            
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop images here...' : 'Upload News Images'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag & drop images here, or click to select files
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`Max ${maxFiles} images`}
                color="default"
                variant="outlined"
              />
              <Chip
                size="small"
                label="Max 5MB each"
                color="default"
                variant="outlined"
              />
              <Chip
                size="small"
                label="JPG, PNG, WebP, GIF"
                color="default"
                variant="outlined"
              />
            </Box>
          </motion.div>

          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" sx={{ mb: 2 }}>
                Uploading images... {Math.round(uploadProgress)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ width: '60%', mb: 1 }}
              />
            </Box>
          )}
        </Box>
      </motion.div>

      {/* Uploaded Images Grid */}
      <AnimatePresence>
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon fontSize="small" />
                Uploaded Images ({uploadedImages.length})
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 2,
                  mt: 2
                }}
              >
                {uploadedImages.map((image, index) => (
                  <motion.div
                    key={image.path}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        position: 'relative',
                        '&:hover .delete-button': {
                          opacity: 1
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={image.url}
                        alt={image.fileName}
                        sx={{
                          objectFit: 'cover',
                          backgroundColor: alpha(theme.palette.grey[500], 0.1)
                        }}
                      />
                      <CardActions
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          p: 0
                        }}
                      >
                        <IconButton
                          className="delete-button"
                          size="small"
                          onClick={() => handleRemoveImage(image, index)}
                          sx={{
                            backgroundColor: alpha(theme.palette.error.main, 0.8),
                            color: 'white',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              backgroundColor: theme.palette.error.main,
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                      
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          backgroundColor: alpha(theme.palette.success.main, 0.9),
                          borderRadius: '50%',
                          p: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}