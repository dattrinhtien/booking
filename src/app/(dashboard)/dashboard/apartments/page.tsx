'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, MapPin, Users, DollarSign, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Apartment {
  id: string
  name: string
  address: string
  maxGuests: number
  basePrice: number
}

const initialApartments: Apartment[] = [
  {
    id: '1',
    name: 'Căn hộ Mẫu 01',
    address: '123 Đường Bao Biển, Hạ Long',
    maxGuests: 4,
    basePrice: 1000000,
  },
  {
    id: '2',
    name: 'Căn hộ Mẫu 02',
    address: '456 Bến Đoan, Hồng Gai, Hạ Long',
    maxGuests: 6,
    basePrice: 1500000,
  }
]

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>(initialApartments)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [maxGuests, setMaxGuests] = useState(4)
  const [basePrice, setBasePrice] = useState(1000000)

  const openAddModal = () => {
    setSelectedApartment(null)
    setName('')
    setAddress('')
    setMaxGuests(4)
    setBasePrice(1000000)
    setIsOpen(true)
  }

  const openEditModal = (apartment: Apartment) => {
    setSelectedApartment(apartment)
    setName(apartment.name)
    setAddress(apartment.address)
    setMaxGuests(apartment.maxGuests)
    setBasePrice(apartment.basePrice)
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !address) {
      toast.error('Vui lòng điền đầy đủ tên và địa chỉ căn hộ!')
      return
    }

    if (selectedApartment) {
      // Edit existing
      setApartments(prev => prev.map(a => a.id === selectedApartment.id 
        ? { ...a, name, address, maxGuests, basePrice } 
        : a
      ))
      toast.success(`Cập nhật căn hộ "${name}" thành công!`)
    } else {
      // Add new
      const newApartment: Apartment = {
        id: Date.now().toString(),
        name,
        address,
        maxGuests,
        basePrice
      }
      setApartments(prev => [...prev, newApartment])
      toast.success(`Thêm căn hộ "${name}" thành công!`)
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    setApartments(prev => prev.filter(a => a.id !== id))
    toast.success(`Đã xóa căn hộ "${name}" thành công!`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Căn hộ</h2>
          <p className="text-muted-foreground">Thêm, sửa và quản lý danh sách căn hộ du lịch Hạ Long.</p>
        </div>
        <Button onClick={openAddModal} className="bg-sky-600 hover:bg-sky-700 gap-2">
          <Plus className="h-4 w-4" /> Thêm Căn hộ
        </Button>
      </div>

      {apartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-slate-50 dark:bg-zinc-900/50">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200">Không có căn hộ nào</h3>
          <p className="text-sm text-muted-foreground mb-4">Hãy thêm căn hộ đầu tiên của bạn để bắt đầu nhận lịch booking.</p>
          <Button onClick={openAddModal} className="bg-sky-600 hover:bg-sky-700">Thêm Căn hộ</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {apartments.map((apartment) => (
            <Card key={apartment.id} className="overflow-hidden border border-slate-100 hover:border-sky-300 dark:border-zinc-800 dark:hover:border-sky-700 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b p-5">
                <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-800 dark:text-zinc-100 group-hover:text-sky-600 transition-colors">
                  <Building2 className="h-5 w-5 text-sky-500" />
                  {apartment.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-zinc-300">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><span className="font-semibold text-slate-800 dark:text-zinc-200">Địa chỉ:</span> {apartment.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-500 shrink-0" />
                    <span><span className="font-semibold text-slate-800 dark:text-zinc-200">Sức chứa:</span> {apartment.maxGuests} khách</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">Giá cơ bản:</span>{' '}
                      <span className="text-sky-600 dark:text-sky-400 font-bold">
                        {new Intl.NumberFormat('vi-VN').format(apartment.basePrice)} đ/đêm
                      </span>
                    </span>
                  </p>
                </div>
                
                <div className="pt-3 border-t flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-zinc-800 border-slate-200"
                    onClick={() => openEditModal(apartment)}
                  >
                    <Edit className="h-3.5 w-3.5" /> Sửa
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 text-red-500 hover:text-white hover:bg-red-500 border-red-100 hover:border-red-500 dark:border-red-950/50"
                    onClick={() => handleDelete(apartment.id, apartment.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Apartment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">
              {selectedApartment ? 'Sửa thông tin Căn hộ' : 'Thêm Căn hộ mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Tên căn hộ *</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Căn hộ Mẫu 03"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                placeholder="Ví dụ: Tòa A, Chung cư Sapphire, Hạ Long"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guests">Sức chứa tối đa</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  value={maxGuests}
                  onChange={e => setMaxGuests(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Giá cơ bản (đ/đêm)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={basePrice}
                  onChange={e => setBasePrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
                {selectedApartment ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
