import { Workflow, WorkflowExecution, ExecutionLog, WorkflowNode } from '../../types/workflow';
import { AINodeExecutor } from './nodes/AINodeExecutor';
import { TriggerNodeExecutor } from './nodes/TriggerNodeExecutor';
import { TransformNodeExecutor } from './nodes/TransformNodeExecutor';
import { ConditionNodeExecutor } from './nodes/ConditionNodeExecutor';
import { OutputNodeExecutor } from './nodes/OutputNodeExecutor';
import { v4 as uuid } from 'uuid';

interface ExecutionContext {
  nodes: Record<string, { output: unknown }>;
  workflow: { variables?: Record<string, string> };
  triggerData?: unknown;
}

export class WorkflowExecutor {
  private context: ExecutionContext = { nodes: {}, workflow: {} };
  private abortController = new AbortController();

  constructor(
    private workflow: Workflow,
    private apiKeys: Record<string, string>,
    private onProgress: (log: ExecutionLog) => void
  ) {}

  async execute(triggerData?: unknown): Promise<WorkflowExecution> {
    this.abortController = new AbortController();
    const execution: WorkflowExecution = {
      id: uuid(),
      workflowId: this.workflow.id,
      status: 'running',
      startTime: Date.now(),
      logs: [],
      triggerData,
    };

    try {
      const order = this.topologicalSort();
      this.context = {
        nodes: {},
        workflow: { variables: this.workflow.variables || {} },
        triggerData,
      };

      for (const nodeId of order) {
        if (this.abortController.signal.aborted) break;
        const node = this.workflow.nodes.find(n => n.id === nodeId);
        if (!node) continue;
        const log = await this.executeNode(node, triggerData);
        execution.logs.push(log);
        this.onProgress(log);
      }

      execution.status = 'completed';
    } catch (error) {
      execution.status = 'failed';
      console.error('Workflow execution failed:', error);
    }

    execution.endTime = Date.now();
    return execution;
  }

  abort() {
    this.abortController.abort();
  }

  private topologicalSort(): string[] {
    const { nodes, edges } = this.workflow;
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    for (const node of nodes) {
      inDegree[node.id] = 0;
      adj[node.id] = [];
    }

    for (const edge of edges) {
      adj[edge.source] = adj[edge.source] || [];
      adj[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }

    const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
    const result: string[] = [];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      for (const neighbor of adj[nodeId] || []) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) queue.push(neighbor);
      }
    }

    return result;
  }

  private collectInputs(node: WorkflowNode): unknown {
    const incomingEdges = this.workflow.edges.filter(e => e.target === node.id);
    if (incomingEdges.length === 0) return undefined;
    if (incomingEdges.length === 1) {
      return this.context.nodes[incomingEdges[0].source]?.output;
    }
    return incomingEdges.map(e => this.context.nodes[e.source]?.output);
  }

  private async executeNode(node: WorkflowNode, triggerData?: unknown): Promise<ExecutionLog> {
    const log: ExecutionLog = {
      nodeId: node.id,
      nodeLabel: node.data.label,
      status: 'running',
      startTime: Date.now(),
    };
    this.onProgress(log);

    const input = this.collectInputs(node);
    const config = { ...node.data.config, _nodeType: node.data.type };

    try {
      let output: unknown;
      const category = node.data.category;

      if (category === 'trigger') {
        output = await new TriggerNodeExecutor().execute({ config, triggerData });
      } else if (category === 'ai') {
        output = await new AINodeExecutor().execute({
          config,
          input,
          context: this.context as unknown as Record<string, unknown>,
          apiKeys: this.apiKeys,
          signal: this.abortController.signal,
        });
      } else if (category === 'transform') {
        output = await new TransformNodeExecutor().execute({
          config,
          input,
          context: this.context as unknown as Record<string, unknown>,
        });
      } else if (category === 'condition') {
        output = await new ConditionNodeExecutor().execute({
          config,
          input,
          context: this.context as unknown as Record<string, unknown>,
        });
      } else if (category === 'output') {
        output = await new OutputNodeExecutor().execute({ config, input });
      } else {
        output = input;
      }

      this.context.nodes[node.id] = { output };
      log.status = 'success';
      log.input = input;
      log.output = output;
    } catch (error) {
      log.status = 'error';
      log.error = (error as Error).message;
      this.context.nodes[node.id] = { output: null };
    }

    log.endTime = Date.now();
    return log;
  }
}
