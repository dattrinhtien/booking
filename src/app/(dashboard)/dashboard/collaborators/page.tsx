'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Mail, UserCheck, ShieldAlert, Edit, Trash2, Ban } from 'lucide-react'
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

interface Collaborator {
  id: string
  name: string
  email: string
  active: boolean
}

const initialCollaborators: Collaborator[] = [
  { id: '1', name: 'CTV Nguyễn Văn Minh', email: 'collab1@example.com', active: true },
  { id: '2', name: 'CTV Trần Thị Hạnh', email: 'collab2@example.com', active: false },
  { id: '3', name: 'CTV Lê Hoàng Nam', email: 'collab3@example.com', active: true },
]

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [active, setActive] = useState('true')

  const openAddModal = () => {
    setSelectedCollab(null)
    setName('')
    setEmail('')
    setActive('true')
    setIsOpen(true)
  }

  const openEditModal = (collab: Collaborator) => {
    setSelectedCollab(collab)
    setName(collab.name)
    setEmail(collab.email)
    setActive(collab.active ? 'true' : 'false')
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      toast.error('Vui lòng điền đầy đủ tên và email của CTV!')
      return
    }

    if (selectedCollab) {
      // Edit
      setCollaborators(prev => prev.map(c => c.id === selectedCollab.id 
        ? { ...c, name, email, active: active === 'true' } 
        : c
      ))
      toast.success(`Cập nhật thông tin CTV "${name}" thành công!`)
    } else {
      // Add
      const newCollab: Collaborator = {
        id: Date.now().toString(),
        name,
        email,
        active: active === 'true'
      }
      setCollaborators(prev => [...prev, newCollab])
      toast.success(`Đã thêm Cộng tác viên "${name}" thành công!`)
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== id))
    toast.success(`Đã xóa Cộng tác viên "${name}" khỏi hệ thống!`)
  }

  const toggleStatus = (collab: Collaborator) => {
    const nextStatus = !collab.active
    setCollaborators(prev => prev.map(c => c.id === collab.id 
      ? { ...c, active: nextStatus } 
      : c
    ))
    if (nextStatus) {
      toast.success(`Đã kích hoạt tài khoản của "${collab.name}"!`)
    } else {
      toast.warning(`Đã tạm khóa tài khoản của "${collab.name}"!`)
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
              {collaborators.length === 0 ? (
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
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Trạng thái hoạt động</Label>
              <Select value={active} onValueChange={(val) => setActive(val || 'true')}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động (Được truy cập)</SelectItem>
                  <SelectItem value="false">Tạm khóa (Ngừng truy cập)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 border-t gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
                {selectedCollab ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
