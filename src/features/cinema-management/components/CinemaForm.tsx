import { MapPin, Phone, Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import type { CinemaDetail, CinemaRequest, CinemaStatus, Facility } from '@/types/cinema/cinema';
import { CINEMA_STATUS_OPTIONS } from '../utils/labels';
import { buildCityOptions } from '../utils/provinces';
import {
   emptyToNull,
   parseCoordinate,
   validateCoordinates,
   validateHotline,
   validateRequiredSelection,
   validateRequiredText,
   type CoordinateErrors,
} from '../utils/validation';
import FacilityPicker from './FacilityPicker';

interface CinemaFormProps {
   initialCinema?: CinemaDetail;
   facilities: Facility[];
   canEditStatus: boolean;
   isSubmitting: boolean;
   submitLabel: string;
   errorMessage?: string;
   successMessage?: string;
   serverFieldErrors?: Record<string, string>;
   onSubmit: (cinemaRequest: CinemaRequest) => void;
}

interface CinemaFieldErrors {
   name?: string;
   city?: string;
   address?: string;
   phone?: string;
   latitude?: string;
   longitude?: string;
   status?: string;
}

function hasFieldErrors(cinemaFieldErrors: CinemaFieldErrors): boolean {
   return Object.values(cinemaFieldErrors).some((message) => message !== undefined);
}

export function CinemaForm({
   initialCinema,
   facilities,
   canEditStatus,
   isSubmitting,
   submitLabel,
   errorMessage,
   successMessage,
   serverFieldErrors = {},
   onSubmit,
}: CinemaFormProps): ReactElement {
   const [name, setName] = useState<string>(initialCinema?.name ?? '');
   const [city, setCity] = useState<string>(initialCinema?.city ?? '');
   const [address, setAddress] = useState<string>(initialCinema?.address ?? '');
   const [phone, setPhone] = useState<string>(initialCinema?.phone ?? '');
   const [latitude, setLatitude] = useState<string>(
      initialCinema?.latitude === null || initialCinema?.latitude === undefined ? '' : String(initialCinema.latitude),
   );
   const [longitude, setLongitude] = useState<string>(
      initialCinema?.longitude === null || initialCinema?.longitude === undefined
         ? ''
         : String(initialCinema.longitude),
   );
   const [status, setStatus] = useState<string>(initialCinema?.status ?? 'ACTIVE');
   const [facilityIds, setFacilityIds] = useState<number[]>(
      initialCinema?.facilities.map((facility) => facility.id) ?? [],
   );
   const [fieldErrors, setFieldErrors] = useState<CinemaFieldErrors>({});

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const coordinateErrors: CoordinateErrors = validateCoordinates(latitude, longitude);
      const nextFieldErrors: CinemaFieldErrors = {
         name: validateRequiredText(name, 'Vui lòng nhập tên rạp', 255),
         city: validateRequiredSelection(city, 'Vui lòng chọn tỉnh/thành phố'),
         address: validateRequiredText(address, 'Vui lòng nhập địa chỉ', 500),
         phone: validateHotline(phone),
         latitude: coordinateErrors.latitude,
         longitude: coordinateErrors.longitude,
         status: validateRequiredSelection(status, 'Vui lòng chọn trạng thái'),
      };
      setFieldErrors(nextFieldErrors);
      if (hasFieldErrors(nextFieldErrors)) {
         return;
      }
      onSubmit({
         name: name.trim(),
         city,
         address: address.trim(),
         phone: emptyToNull(phone),
         latitude: parseCoordinate(latitude),
         longitude: parseCoordinate(longitude),
         status: status as CinemaStatus,
         facilityIds,
      });
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
         {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
         {successMessage && <Alert variant="success">{successMessage}</Alert>}

         <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
               <TextField
                  id="cinema-name"
                  label="Tên cụm rạp"
                  value={name}
                  onChange={setName}
                  maxLength={255}
                  error={fieldErrors.name ?? serverFieldErrors.name}
               />
            </div>
            <SelectField
               id="cinema-city"
               label="Tỉnh/Thành phố"
               value={city}
               onChange={setCity}
               options={buildCityOptions(initialCinema?.city)}
               error={fieldErrors.city ?? serverFieldErrors.city}
            />
            <TextField
               id="cinema-phone"
               label="Số hotline"
               type="tel"
               icon={Phone}
               value={phone}
               onChange={setPhone}
               optional
               error={fieldErrors.phone ?? serverFieldErrors.phone}
            />
            <div className="sm:col-span-2">
               <TextField
                  id="cinema-address"
                  label="Địa chỉ"
                  icon={MapPin}
                  value={address}
                  onChange={setAddress}
                  maxLength={500}
                  error={fieldErrors.address ?? serverFieldErrors.address}
               />
            </div>
            <TextField
               id="cinema-latitude"
               label="Vĩ độ (latitude)"
               value={latitude}
               onChange={setLatitude}
               optional
               placeholder="10.7715"
               error={fieldErrors.latitude ?? serverFieldErrors.latitude}
            />
            <TextField
               id="cinema-longitude"
               label="Kinh độ (longitude)"
               value={longitude}
               onChange={setLongitude}
               optional
               placeholder="106.7042"
               error={fieldErrors.longitude ?? serverFieldErrors.longitude}
            />
            <SelectField
               id="cinema-status"
               label="Trạng thái"
               value={status}
               onChange={setStatus}
               options={CINEMA_STATUS_OPTIONS}
               disabled={!canEditStatus}
               error={fieldErrors.status}
            />
            {!canEditStatus && (
               <p className="self-end text-sm text-ink-500">Chỉ quản trị viên mới được đổi trạng thái cụm rạp.</p>
            )}
         </div>

         <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ink-800">Tiện ích</h3>
            <FacilityPicker facilities={facilities} selectedFacilityIds={facilityIds} onChange={setFacilityIds} />
         </div>

         <Button type="submit" isLoading={isSubmitting} icon={<Save className="size-4" aria-hidden="true" />}>
            {submitLabel}
         </Button>
      </form>
   );
}

export default CinemaForm;
