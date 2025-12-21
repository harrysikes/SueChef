import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from './authStore';

export interface MealPlan {
  id: string;
  userId: string;
  date: Date;
  mealName: string;
  ingredientsUsed: string[];
  createdAt: Date;
}

interface MealState {
  meals: MealPlan[];
  setMeals: (meals: MealPlan[]) => void;
  addMeal: (meal: Omit<MealPlan, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateMeal: (id: string, updates: Partial<MealPlan>) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  loadMeals: () => Promise<void>;
}

export const useMealStore = create<MealState>((set, get) => ({
  meals: [],
  setMeals: (meals) => set({ meals }),
  addMeal: async (meal) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const docRef = await addDoc(collection(db, 'mealPlans'), {
      ...meal,
      userId: user.uid,
      createdAt: new Date(),
    });

    set((state) => ({
      meals: [...state.meals, { ...meal, id: docRef.id, userId: user.uid, createdAt: new Date() }],
    }));
  },
  updateMeal: async (id, updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await updateDoc(doc(db, 'mealPlans', id), updates);

    set((state) => ({
      meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...updates } : meal)),
    }));
  },
  removeMeal: async (id) => {
    await deleteDoc(doc(db, 'mealPlans', id));
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== id),
    }));
  },
  loadMeals: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const q = query(collection(db, 'mealPlans'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const meals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as MealPlan[];

    set({ meals });
  },
}));



