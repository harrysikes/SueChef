import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from './authStore';

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity?: string;
  /** e.g. "half", "3/4 container", "2 cups left" — for use-up suggestions */
  remainingQuantity?: string;
  expirationDate?: Date;
  bestByDate?: Date;
  source: 'manual' | 'grocery' | 'assumed' | 'receipt_scan';
}

interface PantryState {
  items: PantryItem[];
  setItems: (items: PantryItem[]) => void;
  addItem: (item: Omit<PantryItem, 'id' | 'userId'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<PantryItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  loadItems: () => Promise<void>;
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: async (item) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const payload: Record<string, unknown> = {
      ...item,
      userId: user.uid,
      createdAt: new Date(),
    };
    if (item.expirationDate) payload.expirationDate = item.expirationDate;
    if (item.bestByDate) payload.bestByDate = item.bestByDate;
    const docRef = await addDoc(collection(db, 'pantryItems'), payload);

    set((state) => ({
      items: [...state.items, { ...item, id: docRef.id, userId: user.uid }],
    }));
  },
  updateItem: async (id, updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await updateDoc(doc(db, 'pantryItems', id), updates);

    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  },
  removeItem: async (id) => {
    await deleteDoc(doc(db, 'pantryItems', id));
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  loadItems: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const q = query(collection(db, 'pantryItems'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        expirationDate: d.expirationDate?.toDate(),
        bestByDate: d.bestByDate?.toDate(),
      };
    }) as PantryItem[];

    set({ items });
  },
}));



