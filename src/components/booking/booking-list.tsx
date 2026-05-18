'use client'

import { useState, useEffect } from 'react'
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
import { Search, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BookingForm } from '@/components/booking/booking-form'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function BookingList() {
  const [bookings, setBookings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const supabase = createClient()

  // Fetch bookings dynamically from Supabase
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) {
        setBookings(data.map(b => ({
          id: b.id,
          guestName: b.guest_name,
          guestPhone: b.guest_phone || '',
          checkIn: dayjs(b.check_in).toDate(),
          checkOut: dayjs(b.check_out).toDate(),
          status: b.status,
          totalPrice: Number(b.total_price),
          guestIdCard: b.guest_id_card || '',
          notes: b.notes || '',
          apartmentId: b.apartment_id,
          idCardUrl: b.id_card_url || ''
        })))
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      toast.error('Lỗi khi tải danh sách booking: ' + err.message)
    }
  }

  // Subscribe to real-time changes
  useEffect(() => {
    fetchBookings()

    const channel = supabase
      .channel('list-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground font-medium">
                  <FileText className="h-8 w-8 mx-auto opacity-30 mb-1" />
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
        <DialogContent className="sm:max-w-[620px] p-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col w-[95vw] rounded-xl border shadow-2xl">
          <div className="p-6 pb-2 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Chi tiết & Sửa Đặt Phòng</DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 max-h-[70vh] scrollbar-thin">
            {selectedBooking && (
              <BookingForm 
                initialDate={{ start: selectedBooking.checkIn, end: selectedBooking.checkOut }}
                bookingId={selectedBooking.id}
                onSuccess={() => {
                  setIsOpen(false)
                  fetchBookings()
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
