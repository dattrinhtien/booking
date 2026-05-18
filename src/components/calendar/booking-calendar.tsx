'use client'

import { useState, useCallback } from 'react'
import { Calendar, dayjsLocalizer, View, Event } from 'react-big-calendar'
import dayjs from 'dayjs'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { BOOKING_STATUS, STATUS_COLORS } from '@/lib/constants'
import { useBookingModal } from '@/stores/app-store'
import { BookingModal } from '../booking/booking-modal'

// Setup the localizer
const localizer = dayjsLocalizer(dayjs)

interface BookingEvent extends Event {
  id: string
  status: string
  guestName: string
  notes?: string
}

const mockEvents: BookingEvent[] = [
  {
    id: '1',
    title: 'Nguyễn Văn A',
    start: new Date(2026, 4, 20), // May 20, 2026
    end: new Date(2026, 4, 22),
    status: BOOKING_STATUS.BOOKED,
    guestName: 'Nguyễn Văn A',
  },
  {
    id: '2',
    title: 'Trần Thị B',
    start: new Date(2026, 4, 25),
    end: new Date(2026, 4, 27),
    status: BOOKING_STATUS.HOLDING,
    guestName: 'Trần Thị B',
  }
]

export function BookingCalendar() {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')
  const [events, setEvents] = useState<BookingEvent[]>(mockEvents) // Will fetch real data later
  const { openNewBookingModal, openEditBookingModal } = useBookingModal()

  // Manual control functions to fix navigation bugs in Next.js App Router
  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [])
  const onView = useCallback((newView: View) => setView(newView), [])

  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || '#3174ad'
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
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
      <div className="h-[600px] w-full bg-white text-black p-4 rounded-md">
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
