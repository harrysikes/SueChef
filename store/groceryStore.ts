import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from './authStore';

export interface GroceryItem {
  name: string;
  quantity?: string;
  category?: string;
}

export interface GroceryList {
  id: string;
  userId: string;
  name: string;
  type: 'manual' | 'recipe' | 'compiled';
  items: GroceryItem[];
  createdAt: Date;
}

interface GroceryState {
  lists: GroceryList[];
  setLists: (lists: GroceryList[]) => void;
  createList: (name: string, type: 'manual' | 'recipe' | 'compiled', items: GroceryItem[]) => Promise<void>;
  updateList: (id: string, updates: Partial<GroceryList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  compileLists: (listIds: string[]) => Promise<void>;
  loadLists: () => Promise<void>;
}

export const useGroceryStore = create<GroceryState>((set, get) => ({
  lists: [],
  setLists: (lists) => set({ lists }),
  createList: async (name, type, items) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const docRef = await addDoc(collection(db, 'groceryLists'), {
      name,
      type,
      items,
      userId: user.uid,
      createdAt: new Date(),
    });

    set((state) => ({
      lists: [
        ...state.lists,
        { id: docRef.id, name, type, items, userId: user.uid, createdAt: new Date() },
      ],
    }));
  },
  updateList: async (id, updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await updateDoc(doc(db, 'groceryLists', id), updates);

    set((state) => ({
      lists: state.lists.map((list) => (list.id === id ? { ...list, ...updates } : list)),
    }));
  },
  deleteList: async (id) => {
    await deleteDoc(doc(db, 'groceryLists', id));
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
    }));
  },
  compileLists: async (listIds) => {
    const { lists } = get();
    const selectedLists = lists.filter((list) => listIds.includes(list.id));
    const compiledItems: GroceryItem[] = [];
    const itemMap = new Map<string, GroceryItem>();

    selectedLists.forEach((list) => {
      list.items.forEach((item) => {
        const key = item.name.toLowerCase();
        if (itemMap.has(key)) {
          const existing = itemMap.get(key)!;
          existing.quantity = existing.quantity
            ? `${existing.quantity} + ${item.quantity || '1'}`
            : item.quantity || '1';
        } else {
          itemMap.set(key, { ...item });
        }
      });
    });

    compiledItems.push(...Array.from(itemMap.values()));

    const { user } = useAuthStore.getState();
    if (!user) return;

    await addDoc(collection(db, 'groceryLists'), {
      name: 'Master List',
      type: 'compiled',
      items: compiledItems,
      userId: user.uid,
      createdAt: new Date(),
    });

    await get().loadLists();
  },
  loadLists: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const q = query(collection(db, 'groceryLists'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const lists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as GroceryList[];

    set({ lists });
  },
}));



