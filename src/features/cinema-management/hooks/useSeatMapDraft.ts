import { useReducer } from 'react';
import type { SeatMapDraft } from '../utils/seatMapEditing';

const MAX_HISTORY_SIZE: number = 100;

interface SeatMapHistoryState {
   present: SeatMapDraft;
   past: SeatMapDraft[];
   future: SeatMapDraft[];
   strokeStart: SeatMapDraft | null;
}

type SeatMapHistoryAction =
   | { type: 'reset'; seatMapDraft: SeatMapDraft }
   | { type: 'beginStroke' }
   | { type: 'apply'; update: (seatMapDraft: SeatMapDraft) => SeatMapDraft }
   | { type: 'endStroke' }
   | { type: 'undo' }
   | { type: 'redo' };

export interface SeatMapDraftController {
   seatMapDraft: SeatMapDraft;
   canUndo: boolean;
   canRedo: boolean;
   reset: (seatMapDraft: SeatMapDraft) => void;
   beginStroke: () => void;
   apply: (update: (seatMapDraft: SeatMapDraft) => SeatMapDraft) => void;
   endStroke: () => void;
   undo: () => void;
   redo: () => void;
}

function pushHistory(past: SeatMapDraft[], seatMapDraft: SeatMapDraft): SeatMapDraft[] {
   return [...past, seatMapDraft].slice(-MAX_HISTORY_SIZE);
}

function seatMapHistoryReducer(state: SeatMapHistoryState, action: SeatMapHistoryAction): SeatMapHistoryState {
   switch (action.type) {
      case 'reset':
         return { present: action.seatMapDraft, past: [], future: [], strokeStart: null };
      case 'beginStroke':
         return { ...state, strokeStart: state.present };
      case 'apply': {
         const nextSeatMapDraft: SeatMapDraft = action.update(state.present);
         if (nextSeatMapDraft === state.present) {
            return state;
         }
         if (state.strokeStart) {
            return { ...state, present: nextSeatMapDraft };
         }
         return { ...state, present: nextSeatMapDraft, past: pushHistory(state.past, state.present), future: [] };
      }
      case 'endStroke': {
         if (!state.strokeStart) {
            return state;
         }
         if (state.strokeStart === state.present) {
            return { ...state, strokeStart: null };
         }
         return { ...state, strokeStart: null, past: pushHistory(state.past, state.strokeStart), future: [] };
      }
      case 'undo': {
         const previousSeatMapDraft: SeatMapDraft | undefined = state.past[state.past.length - 1];
         if (!previousSeatMapDraft) {
            return state;
         }
         return {
            present: previousSeatMapDraft,
            past: state.past.slice(0, -1),
            future: [state.present, ...state.future],
            strokeStart: null,
         };
      }
      case 'redo': {
         const nextSeatMapDraft: SeatMapDraft | undefined = state.future[0];
         if (!nextSeatMapDraft) {
            return state;
         }
         return {
            present: nextSeatMapDraft,
            past: pushHistory(state.past, state.present),
            future: state.future.slice(1),
            strokeStart: null,
         };
      }
   }
}

export function useSeatMapDraft(initialSeatMapDraft: SeatMapDraft): SeatMapDraftController {
   const [seatMapHistoryState, dispatch] = useReducer(seatMapHistoryReducer, {
      present: initialSeatMapDraft,
      past: [],
      future: [],
      strokeStart: null,
   });

   return {
      seatMapDraft: seatMapHistoryState.present,
      canUndo: seatMapHistoryState.past.length > 0,
      canRedo: seatMapHistoryState.future.length > 0,
      reset(seatMapDraft: SeatMapDraft): void {
         dispatch({ type: 'reset', seatMapDraft });
      },
      beginStroke(): void {
         dispatch({ type: 'beginStroke' });
      },
      apply(update: (seatMapDraft: SeatMapDraft) => SeatMapDraft): void {
         dispatch({ type: 'apply', update });
      },
      endStroke(): void {
         dispatch({ type: 'endStroke' });
      },
      undo(): void {
         dispatch({ type: 'undo' });
      },
      redo(): void {
         dispatch({ type: 'redo' });
      },
   };
}
