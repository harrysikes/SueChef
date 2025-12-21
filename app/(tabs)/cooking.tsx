import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { sendMessageToSue } from '@/services/ai';
import { usePantryStore } from '@/store/pantryStore';
import { useMealStore } from '@/store/mealStore';
import { useGroceryStore } from '@/store/groceryStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CookingModeScreen() {
  const router = useRouter();
  const [recipe, setRecipe] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { items: pantryItems } = usePantryStore();
  const { meals } = useMealStore();
  const { lists: groceryLists } = useGroceryStore();

  const handleStartCooking = async () => {
    if (!recipe.trim()) {
      Alert.alert('Error', 'Please enter a recipe');
      return;
    }

    setLoading(true);
    try {
      const response = await sendMessageToSue(
        `Convert this recipe into simple step-by-step instructions for a beginner cook: ${recipe}`,
        pantryItems,
        meals,
        groceryLists
      );

      // Try to extract steps from response
      const extractedSteps = response
        .split(/\d+\.|\n-|\n\*/)
        .filter((step) => step.trim().length > 10)
        .map((step) => step.trim())
        .slice(0, 10);

      if (extractedSteps.length > 0) {
        setSteps(extractedSteps);
        setCurrentStep(0);
      } else {
        // Fallback: split by newlines
        setSteps([response]);
        setCurrentStep(0);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process recipe');
    } finally {
      setLoading(false);
    }
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
        groceryLists
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
      <View style={styles.header}>
        <Text style={styles.title}>Cooking Mode</Text>
      </View>

      {steps.length === 0 ? (
        <ScrollView style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Enter your recipe:</Text>
            <TextInput
              style={styles.recipeInput}
              placeholder="Paste your recipe here..."
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
    fontFamily: 'System',
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



