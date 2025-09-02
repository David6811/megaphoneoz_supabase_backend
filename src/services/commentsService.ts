import { supabase } from '../config/supabase'
import type { Comment, CreateCommentData, UpdateCommentData } from '../types/database'

export class CommentsService {
  static async getAllComments(
    page = 0,
    limit = 10,
    filters?: {
      status?: string
      post_id?: number
    }
  ) {
    let query = supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.post_id) {
      query = query.eq('post_id', filters.post_id)
    }

    const { data, error, count } = await query
      .range(page * limit, (page + 1) * limit - 1)
      .returns<Comment[]>()

    if (error) throw error
    return { data, count }
  }

  static async getCommentById(id: number) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Comment
  }

  static async createComment(commentData: CreateCommentData) {
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...commentData,
        user_id: user.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data as Comment
  }

  static async updateComment(id: number, commentData: UpdateCommentData) {
    const { data, error } = await supabase
      .from('comments')
      .update(commentData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Comment
  }

  static async deleteComment(id: number) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async approveComment(id: number) {
    return this.updateComment(id, { status: 'approved' })
  }

  static async rejectComment(id: number) {
    return this.updateComment(id, { status: 'spam' })
  }
}