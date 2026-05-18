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

// Mock data
const bookings = [
  {
    id: '1',
    guestName: 'Nguyễn Văn A',
    guestPhone: '0901234567',
    checkIn: new Date(2026, 4, 20),
    checkOut: new Date(2026, 4, 22),
    status: BOOKING_STATUS.BOOKED,
    totalPrice: 2000000,
  },
  {
    id: '2',
    guestName: 'Trần Thị B',
    guestPhone: '0912345678',
    checkIn: new Date(2026, 4, 25),
    checkOut: new Date(2026, 4, 27),
    status: BOOKING_STATUS.HOLDING,
    totalPrice: 2500000,
  }
]

export function BookingList() {
  const [searchTerm, setSearchTerm] = useState('')

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
                <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{booking.guestName}</div>
                    <div className="text-sm text-muted-foreground">{booking.guestPhone}</div>
                  </TableCell>
                  <TableCell>{dayjs(booking.checkIn).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{dayjs(booking.checkOut).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat('vi-VN').format(booking.totalPrice)} đ
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
