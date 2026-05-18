import { create } from 'zustand'

interface BookingModalState {
  isOpen: boolean;
  selectedDate: { start: Date; end: Date } | null;
  selectedBookingId: string | null;
  openNewBookingModal: (start: Date, end: Date) => void;
  openEditBookingModal: (id: string) => void;
  closeModal: () => void;
}

export const useBookingModal = create<BookingModalState>((set) => ({
  isOpen: false,
  selectedDate: null,
  selectedBookingId: null,
  openNewBookingModal: (start, end) => set({ isOpen: true, selectedDate: { start, end }, selectedBookingId: null }),
  openEditBookingModal: (id) => set({ isOpen: true, selectedBookingId: id, selectedDate: null }),
  closeModal: () => set({ isOpen: false, selectedDate: null, selectedBookingId: null }),
}))
