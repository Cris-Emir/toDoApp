import { useTasks } from '@/contexts/TasksContext';
import { Feather } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks(); // ✅ usa contexto
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'light';

  const handleAdd = () => {
    if (!text.trim()) return;
    addTask(text.trim());
    setText('');
  };

  const renderTask = ({ item }: { item: typeof tasks[number] }) => (
    <Swipeable
      renderRightActions={() => (
        <Pressable
          style={styles.deleteBtn}
          onPress={() => deleteTask(item.id)}>
          <Feather name="trash-2" size={20} color="#fff" />
        </Pressable>
      )}>
      <Pressable
        style={[
          styles.taskCard,
          { backgroundColor: isDark ? '#1f1f1f' : '#fff' },
        ]}
        onPress={() => toggleTask(item.id)}>
        <Text
          style={[
            styles.taskText,
            item.done && styles.taskDone,
            { color: isDark ? '#e5e5e5' : '#333' },
          ]}>
          {item.title}
        </Text>
        {item.done && (
          <Feather
            name="check-circle"
            size={18}
            color={isDark ? '#4ade80' : '#22c55e'}
          />
        )}
      </Pressable>
    </Swipeable>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#f2f2f7' },
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        animated
      />

      {/* Card de entrada */}
      <View
        style={[
          styles.inputCard,
          {
            marginTop: 16,
            backgroundColor: isDark ? '#1c1c1e' : '#fff',
            shadowOpacity: isDark ? 0 : 0.1,
          },
        ]}>
        <Feather
          name="plus-circle"
          size={20}
          color={isDark ? '#fff' : '#888'}
        />
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Escribe una tarea..."
          placeholderTextColor={isDark ? '#7d7d7d' : '#999'}
          style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
      </View>

      {/* Lista */}
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather
              name="inbox"
              size={64}
              color={isDark ? '#444' : '#ccc'}
            />
            <Text
              style={[
                styles.emptyText,
                { color: isDark ? '#666' : '#888' },
              ]}>
              ¡Agrega tu primera tarea!
            </Text>
          </View>
        }
      />

      {/* FAB que enfoca input */}
      <Pressable
        style={styles.fab}
        onPress={() => inputRef.current?.focus()}>
        <Feather name="plus" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

/* ---------- Estilos ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /* INPUT CARD */
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { height: 4, width: 0 },
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  /* LISTA */
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { height: 2, width: 0 },
    elevation: 1,
  },
  taskText: { fontSize: 16 },
  taskDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  deleteBtn: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 12,
    marginVertical: 1,
  },
  /* EMPTY */
  emptyBox: { alignItems: 'center', marginTop: 64 },
  emptyText: { marginTop: 12, fontSize: 16 },
  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#007aff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { height: 4, width: 0 },
    elevation: 6,
  },
});
