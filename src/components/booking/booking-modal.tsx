'use client'

import { useBookingModal } from '@/stores/app-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookingForm } from './booking-form'
import { ScrollArea } from '@/components/ui/scroll-area'

export function BookingModal() {
  const { isOpen, closeModal, selectedBookingId, selectedDate } = useBookingModal()

  const isEditing = !!selectedBookingId

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isEditing ? 'Cập nhật Booking' : 'Tạo Booking mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho lịch đặt phòng này.
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="flex-1 p-6 pt-4">
          <BookingForm 
            initialDate={selectedDate} 
            bookingId={selectedBookingId} 
            onSuccess={closeModal} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
