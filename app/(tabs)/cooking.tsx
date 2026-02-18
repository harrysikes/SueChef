import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { sendMessageToSue, recipeToNumberedSteps } from '@/services/ai';
import { pickImage, takePhoto, scanRecipeImage } from '@/services/vision';
import { usePantryStore } from '@/store/pantryStore';
import { useMealStore } from '@/store/mealStore';
import { useGroceryStore } from '@/store/groceryStore';
import { useUserPreferencesStore } from '@/store/userPreferencesStore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CookingScreen() {
  const [recipe, setRecipe] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { items: pantryItems } = usePantryStore();
  const { meals } = useMealStore();
  const { lists: groceryLists } = useGroceryStore();
  const { allergies, standardItems } = useUserPreferencesStore();

  const processRecipeText = async (recipeText: string) => {
    if (!recipeText.trim()) return;
    setLoading(true);
    try {
      const stepsText = await recipeToNumberedSteps(recipeText);
      const extractedSteps = stepsText
        .split(/(?:\r?\n\s*)\d+\.\s*/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);
      if (extractedSteps.length > 0) {
        setSteps(extractedSteps);
        setCurrentStep(0);
      } else {
        setSteps([stepsText]);
        setCurrentStep(0);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCooking = async () => {
    if (!recipe.trim()) {
      Alert.alert('Error', 'Please enter or scan a recipe');
      return;
    }
    await processRecipeText(recipe);
  };

  const runRecipeScan = async (uri: string) => {
    setLoading(true);
    try {
      const recipeText = await scanRecipeImage(uri);
      if (!recipeText.trim()) {
        Alert.alert('No recipe found', 'We couldn\'t read a recipe from this image. Try a clearer photo.');
        return;
      }
      setRecipe(recipeText);
      await processRecipeText(recipeText);
    } catch (error: any) {
      Alert.alert('Scan failed', error.message || 'Could not read recipe from image.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanRecipe = () => {
    Alert.alert(
      'Scan recipe',
      'Take a photo or choose from your library',
      [
        { text: 'Take photo', onPress: async () => {
          const uri = await takePhoto();
          if (uri) await runRecipeScan(uri);
        }},
        { text: 'Choose from library', onPress: async () => {
          const uri = await pickImage();
          if (uri) await runRecipeScan(uri);
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAskQuestion = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await sendMessageToSue(
        `I'm cooking and need help: ${inputText}`,
        pantryItems,
        meals,
        groceryLists,
        { allergies, standardItems }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {steps.length === 0 ? (
        <ScrollView style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Enter or scan your recipe</Text>
            <Pressable
              style={styles.scanButton}
              onPress={handleScanRecipe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={22} color="#fff" />
                  <Text style={styles.scanButtonText}>Scan recipe from photo</Text>
                </>
              )}
            </Pressable>
            <TextInput
              style={styles.recipeInput}
              placeholder="Or paste your recipe here..."
              value={recipe}
              onChangeText={setRecipe}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <Pressable
              style={[styles.startButton, loading && styles.startButtonDisabled]}
              onPress={handleStartCooking}
              disabled={loading}
            >
              <Text style={styles.startButtonText}>
                {loading ? 'Processing...' : 'Start Cooking'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView style={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>Step {currentStep + 1} of {steps.length}</Text>
              <Text style={styles.stepContent}>{steps[currentStep]}</Text>
            </View>

            {messages.length > 0 && (
              <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>Cooking Help</Text>
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.message,
                      message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.navigation}>
            <Pressable
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </Pressable>
            <Pressable
              style={[styles.navButton, currentStep === steps.length - 1 && styles.navButtonDisabled]}
              onPress={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </Pressable>
          </View>

          <View style={styles.helpInput}>
            <TextInput
              style={styles.helpInputField}
              placeholder="Ask Sue for help..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAskQuestion}
            />
            <Pressable
              style={[styles.helpButton, (!inputText.trim() || loading) && styles.helpButtonDisabled]}
              onPress={handleAskQuestion}
              disabled={!inputText.trim() || loading}
            >
              <Text style={styles.helpButtonText}>Ask</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    width: '100%',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'System',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  recipeInput: {
    width: '100%',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 20,
    fontFamily: 'System',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  stepsContainer: {
    flex: 1,
    padding: 20,
  },
  stepCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 12,
    fontFamily: 'System',
  },
  stepContent: {
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
    fontFamily: 'System',
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  helpSection: {
    marginTop: 20,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'System',
  },
  message: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5E5',
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'System',
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#000000',
  },
  helpInput: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
    gap: 8,
  },
  helpInputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 17,
    fontFamily: 'System',
  },
  helpButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  helpButtonDisabled: {
    opacity: 0.5,
  },
  helpButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
