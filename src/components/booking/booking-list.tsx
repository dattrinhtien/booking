'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BOOKING_STATUS } from '@/lib/constants'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BookingForm } from '@/components/booking/booking-form'
import { toast } from 'sonner'

// Mock data representing realistic bookings
const initialBookings = [
  {
    id: '1',
    guestName: 'Nguyễn Văn A',
    guestPhone: '0901234567',
    checkIn: new Date(2026, 4, 20),
    checkOut: new Date(2026, 4, 22),
    status: BOOKING_STATUS.BOOKED,
    totalPrice: 2000000,
    guestIdCard: '001202000123',
    notes: 'Khách VIP, cần chuẩn bị thêm nước lọc và trái cây.',
    apartmentId: '00000000-0000-0000-0000-000000000000'
  },
  {
    id: '2',
    guestName: 'Trần Thị B',
    guestPhone: '0912345678',
    checkIn: new Date(2026, 4, 25),
    checkOut: new Date(2026, 4, 27),
    status: BOOKING_STATUS.HOLDING,
    totalPrice: 2500000,
    guestIdCard: '002303001456',
    notes: 'Yêu cầu phòng tầng cao, view vịnh.',
    apartmentId: '00000000-0000-0000-0000-000000000000'
  }
]

export function BookingList() {
  const [bookings, setBookings] = useState(initialBookings)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.BOOKED:
        return <Badge className="bg-red-500 hover:bg-red-600">Đã book</Badge>
      case BOOKING_STATUS.HOLDING:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Đang giữ</Badge>
      default:
        return <Badge className="bg-green-500 hover:bg-green-600">Trống</Badge>
    }
  }

  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.guestPhone.includes(searchTerm)
  )

  const handleRowClick = (booking: any) => {
    setSelectedBooking(booking)
    setIsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc SĐT..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Không tìm thấy booking nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow 
                  key={booking.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(booking)}
                >
                  <TableCell>
                    <div className="font-semibold text-slate-800 dark:text-zinc-200">{booking.guestName}</div>
                    <div className="text-xs text-muted-foreground">{booking.guestPhone}</div>
                  </TableCell>
                  <TableCell className="font-medium">{dayjs(booking.checkIn).format('DD/MM/YYYY')}</TableCell>
                  <TableCell className="font-medium">{dayjs(booking.checkOut).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right font-bold text-sky-600 dark:text-sky-400">
                    {new Intl.NumberFormat('vi-VN').format(booking.totalPrice)} đ
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">Chi tiết & Sửa Đặt Phòng</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookingForm 
              initialDate={{ start: selectedBooking.checkIn, end: selectedBooking.checkOut }}
              bookingId={selectedBooking.id}
              onSuccess={() => {
                setIsOpen(false)
                toast.success('Cập nhật thông tin đặt phòng thành công!')
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
