/**
 * AI Coach chat screen — streaming responses, persisted history, quick chips.
 * Mirrors web/app/chat/page.tsx adapted for React Native.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { sendChatMessage } from '../services/chatService';
import {
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getRecentFoodLog,
  getDailyGoals,
} from '../lib/storage';
import { sumMacros } from '../lib/nutritionCalc';
import type { ChatMessage, ChatContext } from '../types';

const QUICK_CHIPS = [
  'How am I doing on protein today?',
  'What should I eat for dinner?',
  'How many calories do I have left?',
  'Suggest a high-protein snack',
  'Am I eating enough fibre?',
  'What are good pre-workout foods?',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your NutriAI coach. Ask me anything about your nutrition, meal ideas, or how you're tracking today.",
  createdAt: new Date().toISOString(),
};

let idCounter = 0;
function newId(): string {
  return `msg_${Date.now()}_${++idCounter}`;
}

function TypingDots() {
  return (
    <View style={styles.typingContainer} accessibilityLabel="Assistant is typing">
      <View style={styles.assistantAvatar}>
        <Text style={styles.avatarEmoji}>🤖</Text>
      </View>
      <View style={styles.typingBubble}>
        <Text style={styles.typingDot}>• • •</Text>
      </View>
    </View>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${isUser ? 'You' : 'Assistant'}: ${msg.content}`}
      >
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
          {msg.content}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted history on mount
  useEffect(() => {
    getChatHistory().then(history => {
      if (history.length > 0) setMessages(history);
      setHistoryLoaded(true);
    });
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    };
  }, []);

  // Persist messages when they change (skip during streaming to avoid partial writes)
  useEffect(() => {
    if (!historyLoaded || isStreaming) return;
    saveChatHistory(messages);
  }, [messages, isStreaming, historyLoaded]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const buildContext = useCallback(async (): Promise<ChatContext> => {
    const [entries, goals] = await Promise.all([
      getRecentFoodLog(1),
      getDailyGoals(),
    ]);
    const consumed = sumMacros(entries);
    const recentEntries = await getRecentFoodLog(3);
    const recentMeals = recentEntries.map(e => e.description);
    return { consumed, goals, recentMeals };
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError(null);
    setInput('');

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const assistantId = newId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, assistantMsg]);
    setIsStreaming(true);

    // Small delay to let the list render before scrolling
    setTimeout(scrollToBottom, 50);

    try {
      const context = await buildContext();
      await sendChatMessage(nextMessages, context, chunk => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
        scrollToBottom();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error. Try again.');
      setMessages(prev => prev.filter(m => m.id !== assistantId));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, isStreaming, buildContext, scrollToBottom]);

  const handleClear = useCallback(() => {
    if (showClearConfirm) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      clearChatHistory();
      setMessages([WELCOME_MESSAGE]);
      setShowClearConfirm(false);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowClearConfirm(true);
      clearTimeoutRef.current = setTimeout(() => setShowClearConfirm(false), 3000);
    }
  }, [showClearConfirm]);

  const isOnlyWelcome = messages.length === 1 && messages[0].id === 'welcome';
  const allMessages = [...messages, ...(isStreaming && messages[messages.length - 1]?.content === '' ? [] : [])];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Chat header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerName}>NutriAI Coach</Text>
            <Text style={styles.headerStatus}>Online · Powered by Gemini</Text>
          </View>
        </View>
        {!isOnlyWelcome && (
          <TouchableOpacity
            onPress={handleClear}
            style={[styles.clearButton, showClearConfirm && styles.clearButtonConfirm]}
            accessibilityRole="button"
            accessibilityLabel={showClearConfirm ? 'Confirm clear' : 'Clear conversation'}
          >
            <Text style={[styles.clearButtonText, showClearConfirm && styles.clearButtonTextConfirm]}>
              {showClearConfirm ? 'Confirm' : 'Clear'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages list */}
        <FlatList
          ref={listRef}
          data={allMessages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          accessibilityRole="list"
          accessibilityLabel="Conversation"
          renderItem={({ item }) => <MessageBubble msg={item} />}
          ListFooterComponent={
            <>
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <TypingDots />
              )}
              {error && (
                <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
              )}
            </>
          }
        />

        {/* Quick chips — only at start */}
        {isOnlyWelcome && (
          <View style={styles.chipsContainer}>
            <Text style={styles.chipsLabel}>Suggested</Text>
            <View style={styles.chipsRow}>
              {QUICK_CHIPS.map(chip => (
                <TouchableOpacity
                  key={chip}
                  onPress={() => send(chip)}
                  disabled={isStreaming}
                  style={[styles.chip, isStreaming && styles.chipDisabled]}
                  accessibilityRole="button"
                  accessibilityLabel={chip}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about your nutrition..."
            placeholderTextColor="#94a3b8"
            multiline
            editable={!isStreaming}
            style={styles.textInput}
            accessibilityLabel="Chat message"
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => send(input)}
          />
          <TouchableOpacity
            onPress={() => send(input)}
            disabled={isStreaming || !input.trim()}
            style={[
              styles.sendButton,
              (isStreaming || !input.trim()) && styles.sendButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: isStreaming || !input.trim() }}
          >
            {isStreaming ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  headerStatus: { fontSize: 11, color: '#16a34a', fontWeight: '500', marginTop: 1 },

  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  clearButtonConfirm: { backgroundColor: '#ef4444' },
  clearButtonText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  clearButtonTextConfirm: { color: '#FFFFFF' },

  messageList: { padding: 16, gap: 12, flexGrow: 1 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAssistant: { justifyContent: 'flex-start' },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 14 },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: '#16a34a', borderBottomRightRadius: 4 },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextAssistant: { color: '#334155' },

  typingContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  typingDot: { fontSize: 18, color: '#94a3b8', letterSpacing: 2 },

  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center', paddingVertical: 8 },

  chipsContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  chipsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 12, fontWeight: '500', color: '#475569' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', lineHeight: 22 },
});
