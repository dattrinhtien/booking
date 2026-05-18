'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, dayjsLocalizer, View, Event } from 'react-big-calendar'
import dayjs from 'dayjs'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { BOOKING_STATUS, STATUS_COLORS } from '@/lib/constants'
import { useBookingModal } from '@/stores/app-store'
import { BookingModal } from '../booking/booking-modal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Setup the localizer
const localizer = dayjsLocalizer(dayjs)

interface BookingEvent extends Event {
  id: string
  status: string
  guestName: string
  notes?: string | null
}

export function BookingCalendar() {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')
  const [events, setEvents] = useState<BookingEvent[]>([])
  const { openNewBookingModal, openEditBookingModal } = useBookingModal()
  const supabase = createClient()

  // Fetch bookings dynamically from Supabase
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
      
      if (error) throw error
      if (data) {
        setEvents(data.map(b => ({
          id: b.id,
          title: `${b.guest_name}`,
          start: dayjs(b.check_in).toDate(),
          end: dayjs(b.check_out).toDate(),
          status: b.status,
          guestName: b.guest_name,
          notes: b.notes
        })))
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      toast.error('Lỗi khi tải lịch đặt phòng: ' + err.message)
    }
  }

  // Subscribe to real-time changes
  useEffect(() => {
    fetchBookings()

    const channel = supabase
      .channel('calendar-db-changes')
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

  // Manual control functions to fix navigation bugs in Next.js App Router
  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [])
  const onView = useCallback((newView: View) => setView(newView), [])

  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || '#3174ad'
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.85,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    openNewBookingModal(start, end)
  }

  const handleSelectEvent = (event: BookingEvent) => {
    openEditBookingModal(event.id)
  }

  return (
    <>
      <div className="h-[600px] w-full bg-white text-black p-4 rounded-md shadow-inner border">
        <Calendar
          localizer={localizer}
          events={events}
          date={date}
          onNavigate={onNavigate}
          view={view}
          onView={onView}
          views={['month', 'week', 'day']}
          eventPropGetter={eventStyleGetter}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          popup
          messages={{
            next: "Tiếp",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            noEventsInRange: "Không có booking nào trong khoảng thời gian này.",
          }}
        />
      </div>
      <BookingModal />
    </>
  )
}
