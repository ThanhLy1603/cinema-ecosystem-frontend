export function getInitials(fullName: string): string {
   const words: string[] = fullName
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
   if (words.length === 0) {
      return '?';
   }
   const firstWord: string = words[0];
   const lastWord: string = words[words.length - 1];
   const initials: string = words.length === 1 ? firstWord.charAt(0) : firstWord.charAt(0) + lastWord.charAt(0);
   return initials.toUpperCase();
}
