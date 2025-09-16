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

    // For getting accurate count, we need to explicitly request it
    if (page === 0 && limit === 1) {
      let countQuery = supabase.from('comments').select('*', { count: 'exact', head: true })
      
      if (filters?.status) {
        countQuery = countQuery.eq('status', filters.status)
      }
      if (filters?.post_id) {
        countQuery = countQuery.eq('post_id', filters.post_id)
      }
      
      const { count: totalCount } = await countQuery
      return { data, count: totalCount }
    }

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

  static async getRecentComments(limit = 5) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, 
        content, 
        status, 
        created_at,
        post_id,
        posts(id, title)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as any[]
  }

  static async getAnalyticsData(days = 7) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days + 1)

    const { data, error } = await supabase
      .from('comments')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group comments by date
    const commentsByDate: { [key: string]: number } = {}
    const dateRange = []
    
    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(endDate.getDate() - days + 1 + i)
      const dateKey = date.toISOString().split('T')[0]
      commentsByDate[dateKey] = 0
      dateRange.push({
        date: dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      })
    }

    // Count comments by date
    data?.forEach(comment => {
      const dateKey = comment.created_at.split('T')[0]
      if (commentsByDate.hasOwnProperty(dateKey)) {
        commentsByDate[dateKey]++
      }
    })

    return dateRange.map(day => ({
      name: day.dayName,
      date: day.date,
      comments: commentsByDate[day.date] || 0
    }))
  }
}