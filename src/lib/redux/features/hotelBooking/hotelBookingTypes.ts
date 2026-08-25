export interface HotelBookingSelection {
  hotelSlug: string;
  hotelName: string;
  hotelLocation: string;
  hotelImage: string;
  roomId: string;
  roomName: string;
  pricePerNight: number;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
  rooms: number;
}

export interface HotelBookingState {
  selection: HotelBookingSelection | null;
  lastBookingId: string | null;
}
