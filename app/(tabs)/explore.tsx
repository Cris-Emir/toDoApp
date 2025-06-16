// app/(tabs)/explore.tsx
import { useTasks } from '@/contexts/TasksContext'; // ✅ contexto compartido
import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
dayjs.extend(relativeTime);

/* ---------- Constantes ---------- */
const FILTERS = ['Todas', 'Activas', 'Completadas'] as const;
type Filter = typeof FILTERS[number];

/* ---------- Pantalla ---------- */
export default function ExploreScreen() {
  const { tasks, toggleTask, deleteTask, editTask } = useTasks(); // ✅
  const [filter, setFilter] = useState<Filter>('Todas');
  const scheme = useColorScheme();
  const isDark = scheme === 'light';

  /* --------- Filtro + agrupación --------- */
  const sections = useMemo(() => {
    /* 1. Filtrar */
    let filtered = tasks;
    if (filter === 'Activas') filtered = tasks.filter(t => !t.done);
    if (filter === 'Completadas') filtered = tasks.filter(t => t.done);

    /* 2. Agrupar por día */
    const buckets: Record<string, typeof tasks> = {};
    filtered.forEach(t => {
      const date = t.completedAt ?? t.id;          // si no está hecha, usa creación
      const key = groupKey(date);
      (buckets[key] ??= []).push(t);
    });

    /* 3. Formato SectionList */
    return Object.entries(buckets).map(([title, data]) => ({ title, data }));
  }, [tasks, filter]);

  return (
    <SafeAreaView
      style={[
        { marginTop: 16 },
        styles.container,
        { backgroundColor: isDark ? '#000' : '#f2f2f7' },
      ]}>
      {/* Filtros ----------------------------------------------------------- */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterBtn,
              {
                backgroundColor:
                  filter === f
                    ? isDark
                      ? '#1e40af'
                      : '#2563eb'
                    : 'transparent',
                borderColor: isDark ? '#444' : '#ccc',
              },
            ]}>
            <Text
              style={[
                styles.filterTxt,
                {
                  color:
                    filter === f
                      ? '#fff'
                      : isDark
                      ? '#e5e5e5'
                      : '#333',
                },
              ]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Lista ------------------------------------------------------------- */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#9aa' : '#666' },
            ]}>
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <Pressable
                style={styles.deleteBtn}
                onPress={() => deleteTask(item.id)}>
                <Feather name="trash-2" size={20} color="#fff" />
              </Pressable>
            )}>
            <Pressable
              onPress={() => toggleTask(item.id)}
              onLongPress={() =>
                Alert.prompt(
                  'Editar tarea',
                  '',
                  text => text !== null && editTask(item.id, text.trim()),
                  'plain-text',
                  item.title,
                )
              }
              style={[
                styles.taskCard,
                { backgroundColor: isDark ? '#1f1f1f' : '#fff' },
              ]}>
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
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather
              name="filter"
              size={64}
              color={isDark ? '#444' : '#ccc'}
            />
            <Text
              style={[
                styles.emptyText,
                { color: isDark ? '#666' : '#888' },
              ]}>
              No hay tareas en este filtro
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ---------- Helpers ---------- */
const groupKey = (ts: number | string) => {
  const d = dayjs(Number(ts));
  if (d.isSame(dayjs(), 'day')) return 'Hoy';
  if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return 'Ayer';
  if (d.isAfter(dayjs().subtract(7, 'day'))) return 'Esta semana';
  return d.format('MMMM YYYY');
};

/* ---------- Estilos ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  /* filtros */
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginHorizontal: 12,
  },
  filterBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTxt: { fontSize: 14, fontWeight: '600' },
  /* lista */
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 24 },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
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
  /* empty */
  emptyBox: { alignItems: 'center', marginTop: 64 },
  emptyText: { marginTop: 12, fontSize: 16 },
});
