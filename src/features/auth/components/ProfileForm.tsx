import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Calendar, Image as ImageIcon, Mail, Phone, Save, User as UserIcon } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { updateMyProfile } from '@/api/userApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage, getFieldErrors } from '@/lib/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Gender, UpdateProfileRequest, User, UserProfile } from '@/types/auth';
import { PROFILE_QUERY_KEY } from '../utils/queryKeys';
import { validateAvatarUrl, validateDateOfBirth, validateFullName, validatePhone } from '../utils/validation';

interface ProfileFormProps {
   userProfile: UserProfile;
}

interface ProfileFieldErrors {
   fullName?: string;
   phone?: string;
   dateOfBirth?: string;
   avatarUrl?: string;
}

const GENDER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Không muốn nêu' },
   { value: 'MALE', label: 'Nam' },
   { value: 'FEMALE', label: 'Nữ' },
   { value: 'OTHER', label: 'Khác' },
];

function emptyToNull(value: string): string | null {
   const trimmedValue: string = value.trim();
   return trimmedValue.length === 0 ? null : trimmedValue;
}

function todayAsIsoDate(): string {
   return new Date().toISOString().slice(0, 10);
}

export function ProfileForm({ userProfile }: ProfileFormProps): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const setUser: (user: User | null) => void = useAuthStore((authState) => authState.setUser);
   const [fullName, setFullName] = useState<string>(userProfile.fullName);
   const [phone, setPhone] = useState<string>(userProfile.phone ?? '');
   const [dateOfBirth, setDateOfBirth] = useState<string>(userProfile.dateOfBirth ?? '');
   const [gender, setGender] = useState<string>(userProfile.gender ?? '');
   const [avatarUrl, setAvatarUrl] = useState<string>(userProfile.avatarUrl ?? '');
   const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

   function handleUpdateSuccess(updatedUserProfile: UserProfile): void {
      queryClient.setQueryData<UserProfile>(PROFILE_QUERY_KEY, updatedUserProfile);
      setUser(updatedUserProfile);
   }

   const updateMutation: UseMutationResult<UserProfile, unknown, UpdateProfileRequest> = useMutation<
      UserProfile,
      unknown,
      UpdateProfileRequest
   >({
      mutationFn: updateMyProfile,
      onSuccess: handleUpdateSuccess,
   });

   const errorCode: string | null = updateMutation.isError ? getErrorCode(updateMutation.error) : null;
   const serverFieldErrors: Record<string, string> = updateMutation.isError ? getFieldErrors(updateMutation.error) : {};
   if (errorCode === 'PHONE_ALREADY_EXISTS') {
      serverFieldErrors.phone = getErrorMessage(updateMutation.error);
   }
   const hasServerFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      updateMutation.reset();
      const nextFieldErrors: ProfileFieldErrors = {
         fullName: validateFullName(fullName),
         phone: validatePhone(phone),
         dateOfBirth: validateDateOfBirth(dateOfBirth),
         avatarUrl: validateAvatarUrl(avatarUrl),
      };
      setFieldErrors(nextFieldErrors);
      if (Object.values(nextFieldErrors).some((fieldError) => fieldError !== undefined)) {
         return;
      }
      updateMutation.mutate({
         fullName: fullName.trim(),
         phone: emptyToNull(phone),
         dateOfBirth: emptyToNull(dateOfBirth),
         gender: gender === '' ? null : (gender as Gender),
         avatarUrl: emptyToNull(avatarUrl),
      });
   }

   return (
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
         {updateMutation.isSuccess && <Alert variant="success">Đã cập nhật thông tin cá nhân.</Alert>}
         {updateMutation.isError && !hasServerFieldErrors && (
            <Alert variant="error">{getErrorMessage(updateMutation.error)}</Alert>
         )}

         <TextField
            id="profile-email"
            label="Email"
            type="email"
            icon={Mail}
            value={userProfile.email}
            onChange={() => undefined}
            hint="Email dùng để đăng nhập và không thể thay đổi."
            disabled
         />
         <TextField
            id="profile-fullName"
            label="Họ và tên"
            icon={UserIcon}
            value={fullName}
            onChange={setFullName}
            autoComplete="name"
            maxLength={150}
            error={fieldErrors.fullName ?? serverFieldErrors.fullName}
            disabled={updateMutation.isPending}
         />
         <TextField
            id="profile-phone"
            label="Số điện thoại"
            type="tel"
            icon={Phone}
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
            optional
            error={fieldErrors.phone ?? serverFieldErrors.phone}
            disabled={updateMutation.isPending}
         />
         <div className="grid gap-5 sm:grid-cols-2">
            <TextField
               id="profile-dateOfBirth"
               label="Ngày sinh"
               type="date"
               icon={Calendar}
               value={dateOfBirth}
               onChange={setDateOfBirth}
               max={todayAsIsoDate()}
               optional
               error={fieldErrors.dateOfBirth ?? serverFieldErrors.dateOfBirth}
               disabled={updateMutation.isPending}
            />
            <SelectField
               id="profile-gender"
               label="Giới tính"
               value={gender}
               onChange={setGender}
               options={GENDER_OPTIONS}
               optional
               error={serverFieldErrors.gender}
               disabled={updateMutation.isPending}
            />
         </div>
         <TextField
            id="profile-avatarUrl"
            label="Ảnh đại diện (đường dẫn)"
            icon={ImageIcon}
            value={avatarUrl}
            onChange={setAvatarUrl}
            placeholder="https://..."
            optional
            error={fieldErrors.avatarUrl ?? serverFieldErrors.avatarUrl}
            disabled={updateMutation.isPending}
         />

         <Button
            type="submit"
            size="lg"
            icon={<Save className="size-4" aria-hidden="true" />}
            isLoading={updateMutation.isPending}
         >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
         </Button>
      </form>
   );
}

export default ProfileForm;
