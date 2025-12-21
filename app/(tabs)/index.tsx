import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useMealStore } from '@/store/mealStore';
import { usePantryStore } from '@/store/pantryStore';
import { useReminderStore } from '@/store/reminderStore';
import dayjs from 'dayjs';

export default function HomeScreen() {
  const router = useRouter();
  const { meals } = useMealStore();
  const { items } = usePantryStore();
  const { reminders } = useReminderStore();

  const thisWeekMeals = meals.filter((meal) => {
    const mealDate = dayjs(meal.date);
    const today = dayjs();
    const weekFromNow = today.add(7, 'days');
    return mealDate.isAfter(today) && mealDate.isBefore(weekFromNow);
  });

  const expiringSoon = items.filter((item) => {
    if (!item.expirationDate) return false;
    const expDate = dayjs(item.expirationDate);
    const daysUntilExp = expDate.diff(dayjs(), 'days');
    return daysUntilExp >= 0 && daysUntilExp <= 3;
  });

  const upcomingReminders = reminders
    .filter((r) => dayjs(r.scheduledFor).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.scheduledFor).diff(dayjs(b.scheduledFor)))
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Pressable onPress={() => router.push('/(tabs)/chat')}>
          <Text style={styles.chatButton}>💬 Talk to Sue</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week's Meals</Text>
        {thisWeekMeals.length === 0 ? (
          <Text style={styles.emptyText}>No meals planned this week</Text>
        ) : (
          thisWeekMeals.map((meal) => (
            <View key={meal.id} style={styles.card}>
              <Text style={styles.cardTitle}>{meal.mealName}</Text>
              <Text style={styles.cardSubtitle}>
                {dayjs(meal.date).format('MMM D, YYYY')}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expiring Soon</Text>
        {expiringSoon.length === 0 ? (
          <Text style={styles.emptyText}>No items expiring soon</Text>
        ) : (
          expiringSoon.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                Expires: {dayjs(item.expirationDate).format('MMM D, YYYY')}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
        {upcomingReminders.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming reminders</Text>
        ) : (
          upcomingReminders.map((reminder) => (
            <View key={reminder.id} style={styles.card}>
              <Text style={styles.cardTitle}>{reminder.message}</Text>
              <Text style={styles.cardSubtitle}>
                {dayjs(reminder.scheduledFor).format('MMM D, YYYY h:mm A')}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'System',
  },
  chatButton: {
    fontSize: 17,
    color: '#007AFF',
    fontFamily: 'System',
  },
  section: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'System',
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontFamily: 'System',
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
});



