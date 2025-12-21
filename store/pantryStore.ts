import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from './authStore';

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity?: string;
  expirationDate?: Date;
  source: 'manual' | 'grocery' | 'assumed';
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

    const docRef = await addDoc(collection(db, 'pantryItems'), {
      ...item,
      userId: user.uid,
      createdAt: new Date(),
    });

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
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      expirationDate: doc.data().expirationDate?.toDate(),
    })) as PantryItem[];

    set({ items });
  },
}));



