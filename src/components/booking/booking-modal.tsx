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
      <DialogContent className="sm:max-w-[620px] p-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col w-[95vw] rounded-xl border shadow-2xl">
        <div className="p-6 pb-2 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
              {isEditing ? 'Cập nhật Booking' : 'Tạo Booking mới'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Điền thông tin chi tiết cho lịch đặt phòng này.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 max-h-[70vh] scrollbar-thin">
          <BookingForm 
            initialDate={selectedDate} 
            bookingId={selectedBookingId} 
            onSuccess={closeModal} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
