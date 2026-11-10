import { Check, ChevronDown, CircleAlert, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { normalizeSearchText } from '@/lib/searchText';
import { cn } from '@/lib/utils';
import { useOutsideClick } from '@/lib/useOutsideClick';

export interface SelectOption {
   value: string;
   label: string;
}

interface SelectFieldProps {
   id: string;
   label: string;
   value: string;
   onChange: (value: string) => void;
   options: SelectOption[];
   error?: string;
   disabled?: boolean;
   optional?: boolean;
   placeholder?: string;
   hideLabel?: boolean;
   triggerClassName?: string;
   menuClassName?: string;
}

const DEFAULT_PLACEHOLDER: string = 'Chọn...';
const EMPTY_RESULT_MESSAGE: string = 'Không tìm thấy kết quả';

export function SelectField({
   id,
   label,
   value,
   onChange,
   options,
   error,
   disabled = false,
   optional = false,
   placeholder = DEFAULT_PLACEHOLDER,
   hideLabel = false,
   triggerClassName,
   menuClassName,
}: SelectFieldProps): ReactElement {
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const [searchText, setSearchText] = useState<string>('');
   const [activeIndex, setActiveIndex] = useState<number>(0);
   const containerRef = useRef<HTMLDivElement>(null);
   const triggerRef = useRef<HTMLButtonElement>(null);
   const searchInputRef = useRef<HTMLInputElement>(null);
   const messageId: string = `${id}-message`;
   const listboxId: string = `${id}-listbox`;
   const hasError: boolean = Boolean(error);

   const selectedOption: SelectOption | undefined = options.find((selectOption) => selectOption.value === value);
   const normalizedSearchText: string = normalizeSearchText(searchText);
   const filteredOptions: SelectOption[] = options.filter((selectOption) =>
      normalizeSearchText(selectOption.label).includes(normalizedSearchText),
   );
   const canClear: boolean = !disabled && value !== '';
   const activeOptionId: string | undefined =
      isOpen && filteredOptions.length > 0 ? `${id}-option-${activeIndex}` : undefined;

   const closeDropdown: () => void = useCallback((): void => setIsOpen(false), []);
   useOutsideClick(containerRef, closeDropdown);

   function openDropdown(): void {
      if (disabled) {
         return;
      }
      setSearchText('');
      const selectedIndex: number = options.findIndex((selectOption) => selectOption.value === value);
      setActiveIndex(Math.max(selectedIndex, 0));
      setIsOpen(true);
   }

   function toggleDropdown(): void {
      if (isOpen) {
         closeDropdown();
         return;
      }
      openDropdown();
   }

   function selectOption(nextValue: string): void {
      onChange(nextValue);
      closeDropdown();
      triggerRef.current?.focus();
   }

   function clearSelection(): void {
      onChange('');
      closeDropdown();
      triggerRef.current?.focus();
   }

   function handleSearchChange(nextSearchText: string): void {
      setSearchText(nextSearchText);
      setActiveIndex(0);
   }

   function handleTriggerKeyDown(keyboardEvent: KeyboardEvent<HTMLButtonElement>): void {
      if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'ArrowUp') {
         keyboardEvent.preventDefault();
         openDropdown();
      }
   }

   function handleSearchKeyDown(keyboardEvent: KeyboardEvent<HTMLInputElement>): void {
      if (keyboardEvent.key === 'ArrowDown') {
         keyboardEvent.preventDefault();
         setActiveIndex(Math.min(activeIndex + 1, Math.max(filteredOptions.length - 1, 0)));
      } else if (keyboardEvent.key === 'ArrowUp') {
         keyboardEvent.preventDefault();
         setActiveIndex(Math.max(activeIndex - 1, 0));
      } else if (keyboardEvent.key === 'Enter') {
         keyboardEvent.preventDefault();
         const activeOption: SelectOption | undefined = filteredOptions[activeIndex];
         if (activeOption) {
            selectOption(activeOption.value);
         }
      } else if (keyboardEvent.key === 'Escape') {
         keyboardEvent.preventDefault();
         closeDropdown();
         triggerRef.current?.focus();
      } else if (keyboardEvent.key === 'Tab') {
         closeDropdown();
      }
   }

   function focusSearchInput(): void {
      if (isOpen) {
         searchInputRef.current?.focus();
      }
   }
   useEffect(focusSearchInput, [isOpen]);

   function scrollActiveOptionIntoView(): void {
      if (activeOptionId) {
         document.getElementById(activeOptionId)?.scrollIntoView?.({ block: 'nearest' });
      }
   }
   useEffect(scrollActiveOptionIntoView, [activeOptionId]);

   return (
      <div ref={containerRef} className="space-y-1.5">
         <label
            htmlFor={id}
            className={cn(
               'flex items-baseline justify-between text-sm font-semibold text-ink-800',
               hideLabel && 'sr-only',
            )}
         >
            <span>{label}</span>
            {optional && <span className="text-xs font-normal text-ink-400">Không bắt buộc</span>}
         </label>

         <div className="relative">
            <button
               ref={triggerRef}
               id={id}
               type="button"
               role="combobox"
               aria-haspopup="listbox"
               aria-expanded={isOpen}
               aria-controls={listboxId}
               aria-invalid={hasError}
               aria-describedby={error ? messageId : undefined}
               disabled={disabled}
               onClick={toggleDropdown}
               onKeyDown={handleTriggerKeyDown}
               className={cn(
                  'h-12 w-full rounded-xl border bg-white pl-4 text-left text-[15px] shadow-sm outline-none transition-all disabled:bg-ink-50 disabled:text-ink-400',
                  canClear ? 'pr-20' : 'pr-11',
                  hasError
                     ? 'border-danger-400 focus:border-danger-500 focus:ring-4 focus:ring-danger-100'
                     : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                  selectedOption && value !== '' ? 'text-ink-900' : 'text-ink-400',
                  triggerClassName,
               )}
            >
               <span className="block truncate">{selectedOption ? selectedOption.label : placeholder}</span>
            </button>
            {canClear && (
               <button
                  type="button"
                  aria-label="Xóa lựa chọn"
                  onClick={clearSelection}
                  className="absolute right-10 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
               >
                  <X className="size-4" aria-hidden="true" />
               </button>
            )}
            <ChevronDown
               className={cn(
                  'pointer-events-none absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400 transition-transform duration-200',
                  isOpen && 'rotate-180',
               )}
               aria-hidden="true"
            />

            {isOpen && (
               <div
                  className={cn(
                     'absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-ink-100 bg-white shadow-soft',
                     menuClassName,
                  )}
               >
                  <div className="relative border-b border-ink-100 p-2">
                     <Search
                        className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                        aria-hidden="true"
                     />
                     <input
                        ref={searchInputRef}
                        type="text"
                        value={searchText}
                        onChange={(changeEvent) => handleSearchChange(changeEvent.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Tìm kiếm..."
                        aria-label="Tìm trong danh sách"
                        aria-controls={listboxId}
                        aria-activedescendant={activeOptionId}
                        autoComplete="off"
                        className="h-10 w-full rounded-lg border border-ink-200 pl-9 pr-3 text-sm text-ink-900 outline-none placeholder:text-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                     />
                  </div>
                  <ul id={listboxId} role="listbox" aria-label={label} className="max-h-60 overflow-y-auto py-1">
                     {filteredOptions.length === 0 && (
                        <li role="presentation" className="px-4 py-3 text-sm text-ink-500">
                           {EMPTY_RESULT_MESSAGE}
                        </li>
                     )}
                     {filteredOptions.map((filteredOption, optionIndex) => (
                        <li
                           key={filteredOption.value}
                           id={`${id}-option-${optionIndex}`}
                           role="option"
                           aria-selected={filteredOption.value === value}
                           onMouseEnter={() => setActiveIndex(optionIndex)}
                           onClick={() => selectOption(filteredOption.value)}
                           className={cn(
                              'flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm',
                              optionIndex === activeIndex ? 'bg-brand-50 text-brand-700' : 'text-ink-800',
                              filteredOption.value === value && 'font-semibold',
                           )}
                        >
                           <span className="truncate">{filteredOption.label}</span>
                           {filteredOption.value === value && (
                              <Check className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                           )}
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </div>

         {error && (
            <p
               id={messageId}
               role="alert"
               className="flex items-center gap-1.5 text-[13px] font-medium text-danger-700"
            >
               <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
               {error}
            </p>
         )}
      </div>
   );
}

export default SelectField;
