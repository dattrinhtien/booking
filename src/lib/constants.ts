export const APP_NAME = 'Ha Long Booking'

export const BOOKING_STATUS = {
  AVAILABLE: 'available',
  HOLDING: 'holding',
  BOOKED: 'booked',
} as const;

export type BookingStatusType = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const STATUS_COLORS = {
  [BOOKING_STATUS.AVAILABLE]: '#22c55e', // text-green-500
  [BOOKING_STATUS.HOLDING]: '#eab308',   // text-yellow-500
  [BOOKING_STATUS.BOOKED]: '#ef4444',    // text-red-500
};

export const ROLE = {
  ADMIN: 'admin',
  COLLABORATOR: 'collaborator',
} as const;
