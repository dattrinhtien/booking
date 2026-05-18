import { BookingCalendar } from '@/components/calendar/booking-calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Lịch Booking</h2>
      <Card>
        <CardContent className="pt-6">
          <BookingCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
