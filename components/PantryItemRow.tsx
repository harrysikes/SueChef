import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PantryItem } from '@/store/pantryStore';
import dayjs from 'dayjs';

interface PantryItemRowProps {
  item: PantryItem;
  onUpdate: (id: string, updates: Partial<PantryItem>) => void;
  onDelete: () => void;
}

export default function PantryItemRow({ item, onUpdate, onDelete }: PantryItemRowProps) {
  const isExpiringSoon = item.expirationDate
    ? dayjs(item.expirationDate).diff(dayjs(), 'days') <= 3 && dayjs(item.expirationDate).diff(dayjs(), 'days') >= 0
    : false;

  const isExpired = item.expirationDate ? dayjs(item.expirationDate).isBefore(dayjs()) : false;

  return (
    <View style={[styles.row, isExpiringSoon && styles.rowExpiring, isExpired && styles.rowExpired]}>
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        {item.quantity && <Text style={styles.quantity}>{item.quantity}</Text>}
        {item.expirationDate && (
          <Text style={[styles.expiration, isExpired && styles.expirationExpired]}>
            {isExpired ? 'Expired' : 'Expires'}: {dayjs(item.expirationDate).format('MMM D, YYYY')}
          </Text>
        )}
        <Text style={styles.source}>Source: {item.source}</Text>
      </View>
      <Pressable onPress={onDelete} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowExpiring: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  rowExpired: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'System',
  },
  quantity: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
    fontFamily: 'System',
  },
  expiration: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
    fontFamily: 'System',
  },
  expirationExpired: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  source: {
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'capitalize',
    fontFamily: 'System',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
});



