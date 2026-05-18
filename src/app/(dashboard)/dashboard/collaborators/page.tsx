'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Mail, UserCheck, ShieldAlert, Edit, Trash2, Ban, Loader2, Key } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  getCollaboratorsAction,
  createCollaboratorAction,
  updateCollaboratorAction,
  toggleCollaboratorStatusAction,
  deleteCollaboratorAction
} from '@/app/actions/collaborators'

interface Collaborator {
  id: string
  name: string
  email: string
  active: boolean
}

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [active, setActive] = useState('true')

  // Fetch collaborators from database on mount
  const fetchCollaborators = async () => {
    setLoading(true)
    try {
      const res = await getCollaboratorsAction()
      if (res.success && res.data) {
        setCollaborators(res.data.map((p: any) => ({
          id: p.id,
          name: p.full_name || 'Không tên',
          email: p.email,
          active: p.is_active
        })))
      } else {
        toast.error('Lỗi tải CTV: ' + res.error)
      }
    } catch (err: any) {
      toast.error('Lỗi kết nối máy chủ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollaborators()
  }, [])

  const openAddModal = () => {
    setSelectedCollab(null)
    setName('')
    setEmail('')
    setPassword('')
    setActive('true')
    setIsOpen(true)
  }

  const openEditModal = (collab: Collaborator) => {
    setSelectedCollab(collab)
    setName(collab.name)
    setEmail(collab.email)
    setPassword('') // Don't show password for editing
    setActive(collab.active ? 'true' : 'false')
    setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      toast.error('Vui lòng điền đầy đủ tên và email của CTV!')
      return
    }

    setSubmitting(true)
    try {
      if (selectedCollab) {
        // Edit existing CTV in Auth and Profile
        const res = await updateCollaboratorAction(
          selectedCollab.id,
          name,
          email,
          active === 'true'
        )

        if (res.success) {
          toast.success(`Cập nhật CTV "${name}" thành công!`)
          setIsOpen(false)
          fetchCollaborators()
        } else {
          toast.error('Cập nhật thất bại: ' + res.error)
        }
      } else {
        // Create new CTV in Auth and Profile
        const res = await createCollaboratorAction(
          name,
          email,
          active === 'true',
          password || 'Halong@2026'
        )

        if (res.success) {
          toast.success(`Đã tạo tài khoản cho CTV "${name}" thành công!`)
          setIsOpen(false)
          fetchCollaborators()
        } else {
          toast.error('Tạo tài khoản thất bại: ' + res.error)
        }
      }
    } catch (err: any) {
      toast.error('Lỗi khi lưu dữ liệu: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản CTV "${name}" khỏi hệ thống?`)) {
      return
    }

    try {
      const res = await deleteCollaboratorAction(id)
      if (res.success) {
        toast.success(`Đã xóa Cộng tác viên "${name}" khỏi hệ thống!`)
        fetchCollaborators()
      } else {
        toast.error('Xóa CTV thất bại: ' + res.error)
      }
    } catch (err: any) {
      toast.error('Lỗi khi xóa CTV: ' + err.message)
    }
  }

  const toggleStatus = async (collab: Collaborator) => {
    const nextStatus = !collab.active
    try {
      const res = await toggleCollaboratorStatusAction(collab.id, nextStatus)
      if (res.success) {
        if (nextStatus) {
          toast.success(`Đã mở khóa tài khoản của "${collab.name}"!`)
        } else {
          toast.warning(`Đã tạm khóa tài khoản của "${collab.name}"!`)
        }
        fetchCollaborators()
      } else {
        toast.error('Thay đổi trạng thái thất bại: ' + res.error)
      }
    } catch (err: any) {
      toast.error('Lỗi khi đổi trạng thái: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cộng tác viên</h2>
          <p className="text-muted-foreground">Quản lý tài khoản CTV, cấp quyền truy cập bán phòng căn hộ du lịch.</p>
        </div>
        <Button onClick={openAddModal} className="bg-sky-600 hover:bg-sky-700 gap-2">
          <Plus className="h-4 w-4" /> Thêm CTV
        </Button>
      </div>

      <Card className="border border-slate-100 hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-semibold pl-6 py-4">Tên cộng tác viên</TableHead>
                <TableHead className="font-semibold py-4">Email liên hệ</TableHead>
                <TableHead className="font-semibold py-4">Trạng thái</TableHead>
                <TableHead className="font-semibold text-right pr-6 py-4">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2 text-sky-500" />
                    Đang tải danh sách cộng tác viên...
                  </TableCell>
                </TableRow>
              ) : collaborators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto opacity-35 mb-2" />
                    Không tìm thấy cộng tác viên nào trong hệ thống.
                  </TableCell>
                </TableRow>
              ) : (
                collaborators.map((collab) => (
                  <TableRow key={collab.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <TableCell className="font-bold text-slate-800 dark:text-zinc-200 pl-6 py-4 flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-500" />
                      {collab.name}
                    </TableCell>
                    <TableCell className="font-medium py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 opacity-70" />
                        {collab.email}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {collab.active ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1 pl-1.5 pr-2 py-0.5 rounded-full font-semibold">
                          <UserCheck className="h-3.5 w-3.5" /> Hoạt động
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 pl-1.5 pr-2 py-0.5 rounded-full font-semibold">
                          <ShieldAlert className="h-3.5 w-3.5" /> Đã khóa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex gap-1.5 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                          onClick={() => openEditModal(collab)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Sửa
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={collab.active ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"}
                          onClick={() => toggleStatus(collab)}
                        >
                          <Ban className="h-3.5 w-3.5 mr-1" /> {collab.active ? 'Khóa' : 'Mở khóa'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(collab.id, collab.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Collaborator Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">
              {selectedCollab ? 'Sửa thông tin CTV' : 'Thêm Cộng tác viên mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Tên CTV *</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={submitting}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email">Địa chỉ Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Password Field: ONLY show for creating new CTV */}
            {!selectedCollab && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu đăng nhập</Label>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Key className="h-3 w-3" /> Mặc định: Halong@2026
                  </span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Để trống dùng mật khẩu mặc định"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="status">Trạng thái hoạt động</Label>
              <Select value={active} onValueChange={(val) => setActive(val || 'true')} disabled={submitting}>
                <SelectTrigger>
                  <span className="text-sm font-medium">
                    {active === 'true' ? "Hoạt động (Được truy cập)" : "Tạm khóa (Ngừng truy cập)"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động (Được truy cập)</SelectItem>
                  <SelectItem value="false">Tạm khóa (Ngừng truy cập)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 border-t gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Đang lưu...
                  </>
                ) : (
                  selectedCollab ? 'Lưu thay đổi' : 'Tạo mới & Kích hoạt'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
