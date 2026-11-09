import type { SelectOption } from '@/components/ui/SelectField';

export const PROVINCE_NAMES: string[] = [
   'Hà Nội',
   'Hồ Chí Minh',
   'Đà Nẵng',
   'Hải Phòng',
   'Cần Thơ',
   'Huế',
   'An Giang',
   'Bắc Ninh',
   'Cà Mau',
   'Cao Bằng',
   'Đắk Lắk',
   'Điện Biên',
   'Đồng Nai',
   'Đồng Tháp',
   'Gia Lai',
   'Hà Tĩnh',
   'Hưng Yên',
   'Khánh Hòa',
   'Lai Châu',
   'Lâm Đồng',
   'Lạng Sơn',
   'Lào Cai',
   'Nghệ An',
   'Ninh Bình',
   'Phú Thọ',
   'Quảng Ngãi',
   'Quảng Ninh',
   'Quảng Trị',
   'Sơn La',
   'Tây Ninh',
   'Thái Nguyên',
   'Thanh Hóa',
   'Tuyên Quang',
   'Vĩnh Long',
];

export function buildCityOptions(currentCity: string | undefined): SelectOption[] {
   const cityNames: string[] =
      currentCity && !PROVINCE_NAMES.includes(currentCity) ? [currentCity, ...PROVINCE_NAMES] : PROVINCE_NAMES;
   return cityNames.map((cityName) => ({ value: cityName, label: cityName }));
}

export function buildCityFilterOptions(): SelectOption[] {
   return [{ value: '', label: 'Tất cả tỉnh/thành' }, ...buildCityOptions(undefined)];
}
