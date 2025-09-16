import { supabase } from '../config/supabase'

export interface UploadResult {
  url: string
  path: string
  fileName: string
}

export class StorageService {
  private static readonly BUCKET_NAME = 'post-images'
  
  // Initialize storage bucket if not exists
  static async initializeBucket() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.find(bucket => bucket.name === this.BUCKET_NAME)
      
      if (!bucketExists) {
        await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        })
      }
    } catch (error) {
      console.error('Error initializing bucket:', error)
    }
  }

  // Upload single image
  static async uploadImage(file: File, folder = 'articles'): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed')
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        path: filePath,
        fileName: fileName
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Upload multiple images
  static async uploadImages(files: File[], folder = 'articles'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder))
    return Promise.all(uploadPromises)
  }

  // Delete image
  static async deleteImage(filePath: string): Promise<void> {
    try {
      console.log(`Attempting to delete: ${filePath} from bucket: ${this.BUCKET_NAME}`)
      
      // First, check if file exists
      const { data: files, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '', {
          limit: 1000
        })
      
      if (listError) {
        console.warn(`Could not list files to verify existence: ${listError.message}`)
      } else if (files) {
        const fileName = filePath.includes('/') ? filePath.split('/').pop() : filePath
        const fileExists = files.some(file => file.name === fileName)
        console.log(`File ${fileName} exists in storage: ${fileExists}`)
        
        if (!fileExists) {
          throw new Error(`File ${filePath} does not exist in storage`)
        }
      }
      
      // Proceed with deletion
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      console.log('Delete operation result:', { data, error })
      
      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
      
      // Verify deletion by trying to list the file again
      if (files) {
        const { data: verifyFiles } = await supabase.storage
          .from(this.BUCKET_NAME)
          .list(filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '', {
            limit: 1000
          })
        
        if (verifyFiles) {
          const fileName = filePath.includes('/') ? filePath.split('/').pop() : filePath
          const stillExists = verifyFiles.some(file => file.name === fileName)
          
          if (stillExists) {
            throw new Error(`File ${filePath} was not actually deleted - still exists in storage`)
          } else {
            console.log(`Verified: File ${filePath} has been successfully deleted`)
          }
        }
      }
      
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  // Get optimized image URL with transformations
  static getOptimizedImageUrl(
    filePath: string, 
    options?: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'auto'
    }
  ): string {
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)

    if (!options) return publicUrl

    // Add transformation parameters if supported by Supabase
    const params = new URLSearchParams()
    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', options.quality.toString())
    if (options.format) params.append('f', options.format)

    return params.toString() ? `${publicUrl}?${params.toString()}` : publicUrl
  }

  // Compress image before upload (client-side)
  static async compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const width = img.width * ratio
        const height = img.height * ratio

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }
}