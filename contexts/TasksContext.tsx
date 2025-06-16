import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  completedAt?: number | null;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);
const STORAGE_KEY = '@tasks';

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  /* ---------- Persistencia ---------- */
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  /* ---------- CRUD ---------- */
  const addTask = (title: string) =>
    setTasks(prev => [
      ...prev,
      { id: Date.now().toString(), title, done: false },
    ]);

  const toggleTask = (id: string) =>
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              completedAt: !t.done ? Date.now() : null,
            }
          : t,
      ),
    );

  const deleteTask = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const editTask = (id: string, title: string) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, title } : t)));

  return (
    <TasksContext.Provider
      value={{ tasks, addTask, toggleTask, deleteTask, editTask }}>
      {children}
    </TasksContext.Provider>
  );
};

/* ---------- Hook de consumo ---------- */
export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx)
    throw new Error('useTasks debe usarse dentro de <TasksProvider>.');
  return ctx;
};
