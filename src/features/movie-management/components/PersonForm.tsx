import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { createPerson, updatePerson } from '@/api/movieApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import MediaUploadField from '@/components/common/MediaUploadField';
import { createMediaFieldState, getMediaUrlToValidate } from '@/lib/mediaField';
import { useDeferredUpload, type DeferredUpload } from '@/lib/useDeferredUpload';
import type { MediaFieldState } from '@/types/media';
import TextAreaField from '@/components/ui/TextAreaField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/apiError';
import {
   emptyToNull,
   validateOptionalHttpsUrl,
   validateOptionalText,
   validateRequiredText,
} from '@/lib/formValidation';
import { PUBLIC_MOVIES_KEY } from '@/lib/movieQueryKeys';
import type { Person, PersonRequest } from '@/types/movie';
import { ADMIN_MOVIE_LIST_KEY, ADMIN_PERSONS_KEY, PERSON_OPTIONS_KEY } from '../utils/queryKeys';

interface PersonFormProps {
   person?: Person;
   onDone: () => void;
   onCancel: () => void;
}

interface PersonFieldErrors {
   name?: string;
   avatarUrl?: string;
   bio?: string;
}

export function PersonForm({ person, onDone, onCancel }: PersonFormProps): ReactElement {
   const [name, setName] = useState<string>(person?.name ?? '');
   const [avatarMedia, setAvatarMedia] = useState<MediaFieldState>(createMediaFieldState(person?.avatarUrl));
   const deferredUpload: DeferredUpload = useDeferredUpload();
   const [bio, setBio] = useState<string>(person?.bio ?? '');
   const [fieldErrors, setFieldErrors] = useState<PersonFieldErrors>({});
   const queryClient: QueryClient = useQueryClient();

   function handleSaved(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PERSONS_KEY });
      void queryClient.invalidateQueries({ queryKey: PERSON_OPTIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_MOVIE_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_MOVIES_KEY });
      onDone();
   }

   const personMutation: UseMutationResult<Person, unknown, PersonRequest> = useMutation<
      Person,
      unknown,
      PersonRequest
   >({
      mutationFn: (personRequest) => (person ? updatePerson(person.id, personRequest) : createPerson(personRequest)),
      onSuccess: handleSaved,
   });

   const isBusy: boolean = personMutation.isPending || deferredUpload.isUploading;

   async function handleSubmit(formEvent: FormEvent<HTMLFormElement>): Promise<void> {
      formEvent.preventDefault();
      personMutation.reset();
      const nextFieldErrors: PersonFieldErrors = {
         name: validateRequiredText(name, 'Vui lòng nhập tên nghệ sĩ', 150),
         avatarUrl: validateOptionalHttpsUrl(getMediaUrlToValidate(avatarMedia), 500),
         bio: validateOptionalText(bio, 2000),
      };
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.name || nextFieldErrors.avatarUrl || nextFieldErrors.bio) {
         return;
      }
      const resolvedUrls: string[] | null = await deferredUpload.uploadPendingFiles([
         {
            label: 'ảnh nghệ sĩ',
            mediaFieldState: avatarMedia,
            mediaPurpose: 'PERSON_AVATAR',
            onUploaded: (uploadedUrl) => setAvatarMedia(createMediaFieldState(uploadedUrl)),
         },
      ]);
      if (resolvedUrls === null) {
         return;
      }
      personMutation.mutate({ name: name.trim(), avatarUrl: emptyToNull(resolvedUrls[0]), bio: emptyToNull(bio) });
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
         noValidate
      >
         {personMutation.isError && <Alert variant="error">{getErrorMessage(personMutation.error)}</Alert>}
         {deferredUpload.uploadError && <Alert variant="error">{deferredUpload.uploadError}</Alert>}
         <div className="grid gap-4 sm:grid-cols-2">
            <TextField
               id={`person-name-${person?.id ?? 'new'}`}
               label="Tên nghệ sĩ"
               value={name}
               onChange={setName}
               maxLength={150}
               autoFocus
               error={fieldErrors.name}
            />
            <MediaUploadField
               id={`person-avatar-${person?.id ?? 'new'}`}
               label="Ảnh đại diện"
               value={avatarMedia}
               onChange={setAvatarMedia}
               disabled={isBusy}
               mediaPurpose="PERSON_AVATAR"
               accept="image/jpeg,image/png,image/webp"
               placeholder="https://... hoặc tải ảnh lên"
               optional
               error={fieldErrors.avatarUrl}
            />
            <div className="sm:col-span-2">
               <TextAreaField
                  id={`person-bio-${person?.id ?? 'new'}`}
                  label="Tiểu sử"
                  value={bio}
                  onChange={setBio}
                  rows={3}
                  optional
                  maxLength={2000}
                  error={fieldErrors.bio}
               />
            </div>
         </div>
         <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={isBusy} icon={<Save className="size-4" aria-hidden="true" />}>
               {person ? 'Lưu nghệ sĩ' : 'Thêm nghệ sĩ'}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
               Hủy
            </Button>
            {deferredUpload.uploadMessage && (
               <p role="status" className="self-center text-sm font-medium text-ink-600">
                  {deferredUpload.uploadMessage}
               </p>
            )}
         </div>
      </form>
   );
}

export default PersonForm;
