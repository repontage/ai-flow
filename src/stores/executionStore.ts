import { create } from 'zustand';
import { WorkflowExecution, ExecutionLog } from '../types/workflow';

interface ExecutionStore {
  currentExecution: WorkflowExecution | null;
  executions: WorkflowExecution[];
  isRunning: boolean;
  setCurrentExecution: (exec: WorkflowExecution | null) => void;
  updateLog: (log: ExecutionLog) => void;
  addExecution: (exec: WorkflowExecution) => void;
  setRunning: (running: boolean) => void;
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  currentExecution: null,
  executions: [],
  isRunning: false,
  setCurrentExecution: (exec) => set({ currentExecution: exec }),
  updateLog: (log) =>
    set(state => {
      if (!state.currentExecution) return state;
      const logs = [...state.currentExecution.logs];
      const idx = logs.findIndex(l => l.nodeId === log.nodeId && l.startTime === log.startTime);
      if (idx >= 0) logs[idx] = log;
      else logs.push(log);
      return { currentExecution: { ...state.currentExecution, logs } };
    }),
  addExecution: (exec) =>
    set(state => ({ executions: [exec, ...state.executions].slice(0, 20) })),
  setRunning: (running) => set({ isRunning: running }),
}));
