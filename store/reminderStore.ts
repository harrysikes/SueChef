import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from './authStore';

export interface Reminder {
  id: string;
  userId: string;
  type: 'defrost' | 'expiration';
  message: string;
  scheduledFor: Date;
  createdAt: Date;
}

interface ReminderState {
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  loadReminders: () => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  setReminders: (reminders) => set({ reminders }),
  addReminder: async (reminder) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const docRef = await addDoc(collection(db, 'reminders'), {
      ...reminder,
      userId: user.uid,
      createdAt: new Date(),
    });

    set((state) => ({
      reminders: [
        ...state.reminders,
        { ...reminder, id: docRef.id, userId: user.uid, createdAt: new Date() },
      ],
    }));
  },
  updateReminder: async (id, updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await updateDoc(doc(db, 'reminders', id), updates);

    set((state) => ({
      reminders: state.reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, ...updates } : reminder
      ),
    }));
  },
  removeReminder: async (id) => {
    await deleteDoc(doc(db, 'reminders', id));
    set((state) => ({
      reminders: state.reminders.filter((reminder) => reminder.id !== id),
    }));
  },
  loadReminders: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const q = query(collection(db, 'reminders'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const reminders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      scheduledFor: doc.data().scheduledFor?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Reminder[];

    set({ reminders });
  },
}));



