import { supabase } from '../config/supabase'
import type { Post, CreatePostData, UpdatePostData } from '../types/database'

export class PostsService {
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
    return { data, count }
  }

  static async getPostById(id: number) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Post
  }

  static async createPost(postData: CreatePostData) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        author_id: user.user.id
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
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
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