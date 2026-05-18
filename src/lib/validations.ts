import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const bookingSchema = z.object({
  guest_name: z.string().min(2, { message: 'Tên khách hàng không được để trống' }),
  guest_phone: z.string().optional(),
  guest_id_card: z.string().optional(),
  check_in: z.date({
    message: 'Vui lòng chọn ngày nhận phòng',
  }),
  check_out: z.date({
    message: 'Vui lòng chọn ngày trả phòng',
  }),
  price_per_night: z.number().min(0, { message: 'Giá không hợp lệ' }),
  status: z.enum(['holding', 'booked', 'available']),
  notes: z.string().optional(),
  apartment_id: z.string().uuid({ message: 'Vui lòng chọn căn hộ' }),
  id_card_url: z.string().optional(),
}).refine((data) => data.check_out > data.check_in, {
  message: 'Ngày trả phòng phải sau ngày nhận phòng',
  path: ['check_out'],
})

export type BookingFormValues = z.infer<typeof bookingSchema>
