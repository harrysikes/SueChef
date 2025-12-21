import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useGroceryStore } from '@/store/groceryStore';
import { useRouter } from 'expo-router';
import GroceryListCard from '@/components/GroceryListCard';
import { parseRecipeText } from '@/services/ai';
import { pickImage, parseRecipeImage } from '@/services/vision';

export default function GroceryScreen() {
  const router = useRouter();
  const { lists, createList, compileLists } = useGroceryStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());

  const handleCreateList = () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }
    createList(newListName.trim(), 'manual', []);
    setNewListName('');
    setShowCreateModal(false);
  };

  const handleToggleSelect = (listId: string) => {
    const newSelected = new Set(selectedLists);
    if (newSelected.has(listId)) {
      newSelected.delete(listId);
    } else {
      newSelected.add(listId);
    }
    setSelectedLists(newSelected);
  };

  const handleCompileLists = () => {
    if (selectedLists.size < 2) {
      Alert.alert('Error', 'Please select at least 2 lists to compile');
      return;
    }
    compileLists(Array.from(selectedLists));
    setSelectedLists(new Set());
    Alert.alert('Success', 'Lists compiled into master list');
  };

  const handleCreateFromRecipe = () => {
    setShowRecipeModal(true);
  };

  const handleSubmitRecipeText = async () => {
    if (!recipeText.trim()) {
      Alert.alert('Error', 'Please enter recipe text');
      return;
    }
    try {
      const ingredients = await parseRecipeText(recipeText);
      await createList('Recipe List', 'recipe', ingredients);
      setRecipeText('');
      setShowRecipeModal(false);
      Alert.alert('Success', 'Grocery list created from recipe');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to parse recipe');
    }
  };

  const handleUploadRecipePhoto = async () => {
    try {
      const imageUri = await pickImage();
      if (!imageUri) return;
      const ingredients = await parseRecipeImage(imageUri);
      await createList('Recipe List', 'recipe', ingredients);
      Alert.alert('Success', 'Grocery list created from recipe photo');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to parse recipe image');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grocery Lists</Text>
        <View style={styles.headerButtons}>
          {selectedLists.size >= 2 && (
            <Pressable onPress={handleCompileLists} style={styles.compileButton}>
              <Text style={styles.compileButtonText}>Compile ({selectedLists.size})</Text>
            </Pressable>
          )}
          <Pressable onPress={handleCreateFromRecipe} style={styles.recipeButton}>
            <Text style={styles.recipeButtonText}>📷 Recipe</Text>
          </Pressable>
          <Pressable onPress={() => setShowCreateModal(true)} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ New</Text>
          </Pressable>
        </View>
      </View>

      {showCreateModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="List name"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowCreateModal(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreateList} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showRecipeModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create from Recipe</Text>
            <TextInput
              style={[styles.modalInput, styles.recipeInput]}
              placeholder="Paste your recipe here..."
              value={recipeText}
              onChangeText={setRecipeText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => { setShowRecipeModal(false); setRecipeText(''); }} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleUploadRecipePhoto} style={[styles.modalButton, styles.modalButtonSecondary]}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>📷 Photo</Text>
              </Pressable>
              <Pressable onPress={handleSubmitRecipeText} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.listContainer}>
        {lists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No grocery lists yet</Text>
            <Text style={styles.emptySubtext}>Create a list or ask Sue to generate one from a recipe</Text>
          </View>
        ) : (
          lists.map((list) => (
            <Pressable
              key={list.id}
              onPress={() => router.push(`/(tabs)/grocery/${list.id}`)}
            >
              <GroceryListCard
                list={list}
                isSelected={selectedLists.has(list.id)}
                onToggleSelect={() => handleToggleSelect(list.id)}
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
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
    marginBottom: 12,
    fontFamily: 'System',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  compileButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compileButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  recipeButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recipeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: 'System',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'System',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 12,
    fontSize: 17,
    marginBottom: 20,
    fontFamily: 'System',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontFamily: 'System',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
    fontWeight: '600',
  },
  recipeInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtonSecondary: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
  },
  modalButtonTextSecondary: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

