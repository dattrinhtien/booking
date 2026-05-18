'use server'

import { createClient } from '@supabase/supabase-js'

// Helper to create Supabase Admin Client using the secret Service Role Key
async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Thiếu cấu hình SUPABASE_SERVICE_ROLE_KEY trong file biến môi trường!')
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 1. Fetch all collaborator profiles
export async function getCollaboratorsAction() {
  try {
    const supabaseAdmin = await getAdminClient()
    
    // Fetch profiles where role is collaborator
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'collaborator')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('getCollaboratorsAction error:', err)
    return { success: false, error: err.message }
  }
}

// 2. Create a new collaborator in Supabase Auth & profiles
export async function createCollaboratorAction(
  name: string,
  email: string,
  active: boolean,
  password?: string
) {
  try {
    const supabaseAdmin = await getAdminClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'Halong@2026',
      email_confirm: true,
      user_metadata: { full_name: name }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Không thể khởi tạo tài khoản xác thực Auth.')

    // Update the profile (because handle_new_user trigger automatically inserts a default row)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: name,
        is_active: active
      })
      .eq('id', authData.user.id)

    if (profileError) {
      // Cleanup auth user if profile update fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return { success: true, user: authData.user }
  } catch (err: any) {
    console.error('createCollaboratorAction error:', err)
    return { success: false, error: err.message }
  }
}

// 3. Update an existing collaborator (name, email, status)
export async function updateCollaboratorAction(
  id: string,
  name: string,
  email: string,
  active: boolean
) {
  try {
    const supabaseAdmin = await getAdminClient()

    // 1. Update Profile info
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: name,
        is_active: active
      })
      .eq('id', id)

    if (profileError) throw profileError

    // 2. Update Auth email & metadata
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      user_metadata: { full_name: name }
    })

    if (authError) throw authError
    return { success: true }
  } catch (err: any) {
    console.error('updateCollaboratorAction error:', err)
    return { success: false, error: err.message }
  }
}

// 4. Toggle active status of a collaborator
export async function toggleCollaboratorStatusAction(id: string, nextStatus: boolean) {
  try {
    const supabaseAdmin = await getAdminClient()

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: nextStatus })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('toggleCollaboratorStatusAction error:', err)
    return { success: false, error: err.message }
  }
}

// 5. Delete a collaborator completely
export async function deleteCollaboratorAction(id: string) {
  try {
    const supabaseAdmin = await getAdminClient()

    // Deleting the Auth user automatically cascades and deletes the profiles row
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('deleteCollaboratorAction error:', err)
    return { success: false, error: err.message }
  }
}
