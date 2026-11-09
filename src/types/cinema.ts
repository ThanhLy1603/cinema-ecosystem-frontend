export interface CinemaOption {
  id: number;
  name: string;
  city: string;
}

export type CinemaStatus = 'ACTIVE' | 'INACTIVE';

export type HallStatus = 'ACTIVE' | 'MAINTENANCE';

export type ScreenType = '2D' | '3D' | 'IMAX' | '4DX';

export type SeatStatus = 'ACTIVE' | 'MAINTENANCE';

export interface Facility {
  id: number;
  name: string;
  iconUrl: string | null;
  description: string | null;
  deleted: boolean;
}

export interface Hall {
  id: number;
  cinemaId: number;
  name: string;
  screenType: ScreenType;
  totalSeats: number;
  status: HallStatus;
  deleted: boolean;
}

export interface Cinema {
  id: number;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  status: CinemaStatus;
  facilities: Facility[];
  hallCount: number;
  deleted: boolean;
}

export interface CinemaDetail {
  id: number;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  status: CinemaStatus;
  facilities: Facility[];
  halls: Hall[];
  deleted: boolean;
}

export interface SeatType {
  id: number;
  code: string;
  name: string;
  defaultSurcharge: number;
  span: number;
}

export interface SeatLayoutSeat {
  id: number;
  row: string;
  number: number;
  type: string;
  surcharge: number;
  span: number;
  status: SeatStatus;
}

export interface SeatLayout {
  hallId: number;
  cinemaId: number;
  hallName: string;
  screenType: ScreenType;
  hallStatus: HallStatus;
  version: number;
  rows: string[];
  columns: number;
  seats: SeatLayoutSeat[];
}

export interface CinemaSearchParams {
  search?: string;
  city?: string;
  status?: CinemaStatus;
  deleted: boolean;
  page: number;
  size: number;
}

export interface CinemaRequest {
  name: string;
  city: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  status: CinemaStatus;
  facilityIds: number[];
}

export interface FacilityRequest {
  name: string;
  iconUrl: string | null;
  description: string | null;
}

export interface HallRequest {
  name: string;
  screenType: ScreenType;
  status: HallStatus;
}

export interface SeatCellRequest {
  row: string;
  number: number;
  seatTypeCode: string;
  status: SeatStatus;
}

export interface SeatMapRequest {
  version: number;
  seats: SeatCellRequest[];
}

export interface GenerateSeatsRequest {
  rowCount: number;
  columnCount: number;
  seatTypeCode: string;
}
