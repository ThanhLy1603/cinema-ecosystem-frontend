import { Plus, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { CAST_ROLE_OPTIONS } from '@/lib/movie/movieLabels';
import type { PersonOption } from '@/types/movie/movie';

export interface CastDraft {
   key: number;
   personId: string;
   roleType: string;
   characterName: string;
}

interface CastEditorProps {
   castDrafts: CastDraft[];
   personOptions: PersonOption[];
   onChange: (castDrafts: CastDraft[]) => void;
}

export function CastEditor({ castDrafts, personOptions, onChange }: CastEditorProps): ReactElement {
   const personSelectOptions: SelectOption[] = personOptions.map((personOption) => ({
      value: String(personOption.id),
      label: personOption.name,
   }));

   function updateCastDraft(castKey: number, changes: Partial<CastDraft>): void {
      onChange(castDrafts.map((castDraft) => (castDraft.key === castKey ? { ...castDraft, ...changes } : castDraft)));
   }

   function removeCastDraft(castKey: number): void {
      onChange(castDrafts.filter((castDraft) => castDraft.key !== castKey));
   }

   function addCastDraft(): void {
      const nextKey: number = castDrafts.reduce((maxKey, castDraft) => Math.max(maxKey, castDraft.key), 0) + 1;
      onChange([...castDrafts, { key: nextKey, personId: '', roleType: 'ACTOR', characterName: '' }]);
   }

   return (
      <div className="space-y-3">
         {castDrafts.length === 0 && <p className="text-sm text-ink-500">Chưa có đạo diễn hoặc diễn viên nào.</p>}
         {castDrafts.map((castDraft) => (
            <div
               key={castDraft.key}
               className="grid gap-3 rounded-2xl border border-ink-100 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end"
            >
               <SelectField
                  id={`cast-person-${castDraft.key}`}
                  label="Nghệ sĩ"
                  value={castDraft.personId}
                  onChange={(personId) => updateCastDraft(castDraft.key, { personId })}
                  options={personSelectOptions}
                  placeholder="Chọn nghệ sĩ..."
               />
               <SelectField
                  id={`cast-role-${castDraft.key}`}
                  label="Vai trò"
                  value={castDraft.roleType}
                  onChange={(roleType) => updateCastDraft(castDraft.key, { roleType })}
                  options={CAST_ROLE_OPTIONS}
               />
               <TextField
                  id={`cast-character-${castDraft.key}`}
                  label="Tên nhân vật"
                  value={castDraft.characterName}
                  onChange={(characterName) => updateCastDraft(castDraft.key, { characterName })}
                  maxLength={150}
                  optional
               />
               <Button
                  variant="ghost"
                  className="h-12 px-3"
                  aria-label="Gỡ nghệ sĩ khỏi phim"
                  icon={<Trash2 className="size-4" aria-hidden="true" />}
                  onClick={() => removeCastDraft(castDraft.key)}
               />
            </div>
         ))}
         <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={addCastDraft}>
            Thêm nghệ sĩ
         </Button>
      </div>
   );
}

export default CastEditor;
