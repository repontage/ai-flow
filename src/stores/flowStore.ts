import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';
import { v4 as uuid } from 'uuid';

interface FlowStore {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  selectedNodeId: string | null;

  createWorkflow: (name: string, description?: string) => Workflow;
  saveCurrentWorkflow: () => void;
  loadWorkflow: (id: string) => void;
  deleteWorkflow: (id: string) => void;
  exportWorkflow: (id: string) => void;
  importWorkflow: (file: File) => Promise<void>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;

  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  setSelectedNode: (nodeId: string | null) => void;
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflow: null,
      selectedNodeId: null,

      createWorkflow: (name, description) => {
        const workflow: Workflow = {
          id: uuid(),
          name,
          description,
          nodes: [],
          edges: [],
          variables: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ workflows: [...state.workflows, workflow], currentWorkflow: workflow }));
        return workflow;
      },

      saveCurrentWorkflow: () => {
        const { currentWorkflow, workflows } = get();
        if (!currentWorkflow) return;
        const updated = { ...currentWorkflow, updatedAt: new Date().toISOString() };
        set({
          currentWorkflow: updated,
          workflows: workflows.map(w => (w.id === updated.id ? updated : w)),
        });
      },

      loadWorkflow: (id) => {
        const workflow = get().workflows.find(w => w.id === id);
        if (workflow) set({ currentWorkflow: workflow });
      },

      deleteWorkflow: (id) => {
        set(state => ({
          workflows: state.workflows.filter(w => w.id !== id),
          currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        }));
      },

      exportWorkflow: (id) => {
        const workflow = get().workflows.find(w => w.id === id);
        if (!workflow) return;
        const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workflow.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importWorkflow: async (file) => {
        const text = await file.text();
        const workflow = JSON.parse(text) as Workflow;
        workflow.id = uuid();
        workflow.createdAt = new Date().toISOString();
        workflow.updatedAt = new Date().toISOString();
        set(state => ({ workflows: [...state.workflows, workflow] }));
      },

      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

      onNodesChange: (changes: NodeChange<WorkflowNode>[]) => {
        set(state => {
          if (!state.currentWorkflow) return state;
          const nodes = applyNodeChanges(changes, state.currentWorkflow.nodes) as WorkflowNode[];
          return { currentWorkflow: { ...state.currentWorkflow, nodes } };
        });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set(state => {
          if (!state.currentWorkflow) return state;
          const edges = applyEdgeChanges(changes, state.currentWorkflow.edges as Edge[]) as WorkflowEdge[];
          return { currentWorkflow: { ...state.currentWorkflow, edges } };
        });
      },

      onConnect: (connection: Connection) => {
        set(state => {
          if (!state.currentWorkflow) return state;
          const edges = addEdge(
            { ...connection, animated: true, style: { stroke: '#6366f1' } },
            state.currentWorkflow.edges as Edge[]
          ) as WorkflowEdge[];
          return { currentWorkflow: { ...state.currentWorkflow, edges } };
        });
      },

      addNode: (node) => {
        set(state => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: [...state.currentWorkflow.nodes, node],
            },
          };
        });
      },

      updateNodeData: (nodeId, data) => {
        set(state => {
          if (!state.currentWorkflow) return state;
          const nodes = state.currentWorkflow.nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
          );
          return { currentWorkflow: { ...state.currentWorkflow, nodes } };
        });
      },

      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
    }),
    {
      name: 'ai-flow-storage',
      partialize: (state) => ({ workflows: state.workflows }),
    }
  )
);
