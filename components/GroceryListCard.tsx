import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GroceryList } from '@/store/groceryStore';
import dayjs from 'dayjs';

interface GroceryListCardProps {
  list: GroceryList;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export default function GroceryListCard({ list, isSelected, onToggleSelect }: GroceryListCardProps) {
  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onToggleSelect}
      onLongPress={onToggleSelect}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{list.name}</Text>
        <Text style={styles.type}>{list.type}</Text>
      </View>
      <Text style={styles.itemCount}>{list.items.length} items</Text>
      <Text style={styles.date}>Created {dayjs(list.createdAt).format('MMM D, YYYY')}</Text>
      {list.items.length > 0 && (
        <View style={styles.itemsPreview}>
          {list.items.slice(0, 3).map((item, index) => (
            <Text key={index} style={styles.itemPreview}>
              • {item.name}
            </Text>
          ))}
          {list.items.length > 3 && (
            <Text style={styles.moreItems}>+{list.items.length - 3} more</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
  },
  type: {
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'capitalize',
    fontFamily: 'System',
  },
  itemCount: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
    fontFamily: 'System',
  },
  date: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
    fontFamily: 'System',
  },
  itemsPreview: {
    marginTop: 8,
  },
  itemPreview: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'System',
  },
  moreItems: {
    fontSize: 15,
    color: '#8E8E93',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
});

