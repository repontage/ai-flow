import { BaseNodeData } from './nodes';

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: BaseNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  nodeId: string;
  nodeLabel: string;
  status: 'running' | 'success' | 'error';
  startTime: number;
  endTime?: number;
  input?: unknown;
  output?: unknown;
  error?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  logs: ExecutionLog[];
  triggerData?: unknown;
}
