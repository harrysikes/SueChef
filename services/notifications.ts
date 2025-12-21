import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import { Reminder } from '@/store/reminderStore';
import { useReminderStore } from '@/store/reminderStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  }
  return true;
};

export const scheduleDefrostReminder = async (meatName: string, useDate: Date): Promise<string> => {
  const defrostDate = dayjs(useDate).subtract(1, 'day');
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Defrost Reminder',
      body: `Don't forget to defrost ${meatName} for tomorrow!`,
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: defrostDate.toDate(),
    },
  });

  // Also save to Firestore
  const { addReminder } = useReminderStore.getState();
  await addReminder({
    type: 'defrost',
    message: `Defrost ${meatName}`,
    scheduledFor: defrostDate.toDate(),
  });

  return notificationId;
};

export const scheduleExpirationReminder = async (itemName: string, expirationDate: Date): Promise<string> => {
  const reminderDate = dayjs(expirationDate).subtract(2, 'days');
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expiring Soon',
      body: `${itemName} expires in 2 days. Use it soon!`,
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: reminderDate.toDate(),
    },
  });

  // Also save to Firestore
  const { addReminder } = useReminderStore.getState();
  await addReminder({
    type: 'expiration',
    message: `${itemName} expires soon`,
    scheduledFor: reminderDate.toDate(),
  });

  return notificationId;
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};


