import { supabase } from '../config/supabase'
import { StorageService } from './storageService'
import type { Post, CreatePostData, UpdatePostData } from '../types/database'

export class PostsService {
  // Helper method to extract image path from URL
  private static extractImagePathFromUrl(url: string): string | null {
    if (!url) return null
    
    console.log('Extracting path from URL:', url) // Debug
    
    // Handle different URL formats:
    // 1. Full Supabase URL: https://[project].supabase.co/storage/v1/object/public/post-images/folder/filename
    // 2. Bucket-specific URL: /post-images/folder/filename 
    // 3. Direct filename: filename.jpg
    
    // Try to extract from full Supabase URL
    const supabaseMatch = url.match(/\/storage\/v1\/object\/public\/post-images\/(.+)$/)
    if (supabaseMatch) {
      return supabaseMatch[1]
    }
    
    // Try to extract from bucket path
    if (url.includes('/post-images/')) {
      const parts = url.split('/post-images/')
      if (parts.length > 1) {
        return parts[1]
      }
    }
    
    // If it's just a filename, try to determine the folder
    const fileName = url.split('/').pop()
    if (fileName && (fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.jpeg') || fileName.includes('.webp'))) {
      // Try different known folders
      const knownFolders = ['new-covers', 'articles', 'cover-images']
      
      // For now, default to new-covers based on user feedback
      return `new-covers/${fileName}`
    }
    
    return null
  }

  // Helper method to try deleting image from multiple possible paths
  private static async tryDeleteImage(imagePath: string): Promise<void> {
    const fileName = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath
    
    // Try different possible paths
    const pathsToTry = [
      imagePath, // Original path
      `new-covers/${fileName}`, // Based on user feedback
      `articles/${fileName}`, // Default StorageService folder
      `cover-images/${fileName}`, // Alternative folder
      fileName // Just filename
    ]
    
    // Remove duplicates
    const uniquePaths = Array.from(new Set(pathsToTry)).filter(Boolean) as string[]
    
    let deleted = false
    
    for (const path of uniquePaths) {
      if (deleted) break
      
      try {
        console.log(`Trying to delete image at path: ${path}`) // Debug
        await StorageService.deleteImage(path)
        console.log(`Successfully deleted image: ${path}`)
        deleted = true
      } catch (err) {
        console.warn(`Failed to delete image at ${path}:`, err)
        // Continue trying other paths
      }
    }
    
    if (!deleted) {
      console.error(`Could not delete image with any of these paths:`, uniquePaths)
    }
  }
  static async getAllPosts(
    page = 0,
    limit = 10,
    filters?: {
      status?: string
      category?: string
      search?: string
    }
  ) {
    let query = supabase
      .from('posts')
      .select(`
        *
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
      .range(page * limit, (page + 1) * limit - 1)
      .returns<Post[]>()

    if (error) throw error
    
    // Debug: log first post to see available fields (can be removed in production)
    if (data && data.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('Sample post fields:', Object.keys(data[0]))
      console.log('Sample post data:', data[0])
    }
    
    return { data, count }
  }

  static async getPostById(id: number) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error loading post:', error)
      throw error
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw post data from database:', data) // Debug log
    }
    return data as Post
  }

  static async createPost(postData: CreatePostData) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    // 提取用户信息
    const userEmail = user.user.email || ''
    const userName = user.user.user_metadata?.display_name || 
                    user.user.user_metadata?.full_name || 
                    userEmail.split('@')[0] || 
                    'Anonymous Author'
    const userAvatar = user.user.user_metadata?.avatar_url || null

    console.log('Creating post with user info:', {
      userId: user.user.id,
      userName,
      userEmail,
      userAvatar
    })

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        author_id: user.user.id,
        author_name: userName,
        author_email: userEmail,
        author_avatar_url: userAvatar
      })
      .select()
      .single()

    if (error) throw error
    return data as Post
  }

  static async updatePost(id: number, postData: UpdatePostData) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Post
  }

  static async deletePost(id: number) {
    try {
      // First, get the post to find associated images
      const post = await this.getPostById(id)
      
      // Delete associated images from storage
      const imagesToDelete: string[] = []
      
      // Add cover image if exists
      if (post.cover_image_url) {
        console.log('Cover image URL:', post.cover_image_url) // Debug
        
        const imagePath = this.extractImagePathFromUrl(post.cover_image_url)
        if (imagePath) {
          console.log('Will delete cover image:', imagePath) // Debug
          imagesToDelete.push(imagePath)
        }
      }
      
      // Delete images from content (find all image URLs in HTML content)
      if (post.content) {
        const imgRegex = /<img[^>]+src="([^">]+)"/g
        let match
        while ((match = imgRegex.exec(post.content)) !== null) {
          const imgUrl = match[1]
          const imagePath = this.extractImagePathFromUrl(imgUrl)
          if (imagePath) {
            imagesToDelete.push(imagePath)
          }
        }
      }
      
      // Delete all found images from storage
      const deletedImages = []
      const failedImages = []
      
      for (const imagePath of imagesToDelete) {
        try {
          await this.tryDeleteImage(imagePath)
          deletedImages.push(imagePath)
        } catch (error) {
          console.error(`Failed to delete image ${imagePath}:`, error)
          failedImages.push(imagePath)
        }
      }
      
      // Report image deletion status
      if (failedImages.length > 0) {
        console.warn(`Warning: ${failedImages.length} images could not be deleted:`, failedImages)
        // Don't throw error here, continue with post deletion
        // This allows the user to manually delete images from Supabase dashboard
      }
      
      // Finally, delete the post from database
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Successfully deleted post ${id}. Images deleted: ${deletedImages.length}, Images failed: ${failedImages.length}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  static async getCategories() {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .not('category', 'is', null)

    if (error) throw error
    
    const uniqueCategories = new Set(data.map(item => item.category).filter(Boolean))
    const categories = Array.from(uniqueCategories)
    return categories
  }
}