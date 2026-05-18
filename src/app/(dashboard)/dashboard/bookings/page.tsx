import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingList } from '@/components/booking/booking-list'

export default function BookingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Danh sách Booking</h2>
      </div>
      <Card>
        <CardContent className="pt-6">
          <BookingList />
        </CardContent>
      </Card>
    </div>
  )
}
