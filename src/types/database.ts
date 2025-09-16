export interface User {
  id: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  display_name: string
  parent_id?: number
  level: number
  url_path: string
  hierarchical_name: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  author_id: string
  author_name?: string
  author_email?: string
  author_avatar_url?: string
  title: string
  subtitle?: string
  content: string
  excerpt?: string
  status: 'publish' | 'draft' | 'private' | 'scheduled'
  post_type: 'post' | 'page'
  cover_image_url?: string
  category?: string  // Legacy field for backward compatibility
  category_id?: number  // New category system
  tags?: string[]
  featured?: boolean
  scheduled_date?: string
  created_at: string
  updated_at: string
  author?: User
  images?: PostImage[]
  comments_count?: number
}

export interface PostImage {
  id: number
  post_id: number
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: string
}

export interface Comment {
  id: number
  post_id: number
  user_id?: string
  author_name?: string
  author_email?: string
  content: string
  status: 'approved' | 'pending' | 'spam'
  parent_id?: number
  created_at: string
  post?: Post
  user?: User
  replies?: Comment[]
}

export interface CreatePostData {
  title: string
  subtitle?: string
  content: string
  excerpt?: string
  status?: Post['status']
  post_type?: Post['post_type']
  cover_image_url?: string
  category?: string  // Legacy field for backward compatibility
  category_id?: number  // New category system
  tags?: string[]
  featured?: boolean
  scheduled_date?: string
}

export interface UpdatePostData extends Partial<CreatePostData> {
  updated_at?: string
}

export interface CreateCommentData {
  post_id: number
  content: string
  author_name?: string
  author_email?: string
  parent_id?: number
}

export interface UpdateCommentData {
  content?: string
  status?: Comment['status']
}