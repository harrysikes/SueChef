import { create } from 'zustand';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from './authStore';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface StandardItem {
  name: string;
  quantity?: string;
  frequency?: string; // e.g. "weekly", "daily"
}

interface UserPreferencesState {
  allergies: string[];
  standardItems: Partial<Record<MealSlot, StandardItem[]>>;
  setAllergies: (allergies: string[]) => void;
  setStandardItems: (slot: MealSlot, items: StandardItem[]) => void;
  addAllergy: (allergy: string) => Promise<void>;
  removeAllergy: (allergy: string) => Promise<void>;
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
}

const defaultStandardItems: Partial<Record<MealSlot, StandardItem[]>> = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};

export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
  allergies: [],
  standardItems: { ...defaultStandardItems },

  setAllergies: (allergies) => set({ allergies }),

  setStandardItems: (slot, items) =>
    set((state) => ({
      standardItems: { ...state.standardItems, [slot]: items },
    })),

  addAllergy: async (allergy) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    const next = [...get().allergies.filter((a) => a.toLowerCase() !== allergy.toLowerCase()), allergy.trim()].filter(Boolean);
    set({ allergies: next });
    await get().savePreferences();
  },

  removeAllergy: async (allergy) => {
    const next = get().allergies.filter((a) => a.toLowerCase() !== allergy.toLowerCase());
    set({ allergies: next });
    await get().savePreferences();
  },

  loadPreferences: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    const ref = doc(db, 'userPreferences', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      set({
        allergies: d.allergies || [],
        standardItems: { ...defaultStandardItems, ...d.standardItems },
      });
    }
  },

  savePreferences: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    const { allergies, standardItems } = get();
    await setDoc(doc(db, 'userPreferences', user.uid), {
      allergies,
      standardItems,
      updatedAt: new Date(),
    });
  },
}));
