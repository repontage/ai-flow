import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuid } from 'uuid';
import { useFlowStore } from '../../stores/flowStore';
import { AINode } from '../nodes/AINode';
import { TriggerNode } from '../nodes/TriggerNode';
import { TransformNode } from '../nodes/TransformNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { OutputNode } from '../nodes/OutputNode';
import { WorkflowNode } from '../../types/workflow';
import { BaseNodeData, NodeCategory, NodeType } from '../../types/nodes';

const nodeTypes = {
  aiNode: AINode,
  triggerNode: TriggerNode,
  transformNode: TransformNode,
  conditionNode: ConditionNode,
  outputNode: OutputNode,
};

const categoryToReactFlowType = (category: NodeCategory): string => {
  const map: Record<NodeCategory, string> = {
    trigger: 'triggerNode',
    ai: 'aiNode',
    transform: 'transformNode',
    condition: 'conditionNode',
    output: 'outputNode',
  };
  return map[category];
};

export function FlowCanvas() {
  const { currentWorkflow, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } = useFlowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactFlowInstanceRef = useRef<any>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/reactflow');
    if (!data) return;

    const def = JSON.parse(data) as { type: NodeType; category: NodeCategory; label: string; description: string; defaultConfig: Record<string, unknown> };
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    let position = { x: e.clientX - bounds.left - 100, y: e.clientY - bounds.top - 40 };

    if (reactFlowInstanceRef.current) {
      position = reactFlowInstanceRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
    }

    const id = uuid();
    const nodeData: BaseNodeData = {
      id,
      type: def.type,
      category: def.category,
      label: def.label,
      description: def.description,
      inputs: def.category !== 'trigger' ? [{ id: 'input', label: '입력', type: 'any' }] : [],
      outputs: def.category !== 'output' ? [{ id: 'output', label: '출력', type: 'any' }] : [],
      config: { ...def.defaultConfig },
      status: 'idle',
    };

    const node: WorkflowNode = {
      id,
      type: categoryToReactFlowType(def.category),
      position,
      data: nodeData,
    };

    addNode(node);
  }, [addNode]);

  if (!currentWorkflow) return null;

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full bg-slate-950">
      <ReactFlow
        nodes={currentWorkflow.nodes}
        edges={currentWorkflow.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => { reactFlowInstanceRef.current = instance; }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        fitView
        className="bg-slate-950"
        defaultEdgeOptions={{ animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls className="[&>button]:bg-slate-800 [&>button]:border-slate-600 [&>button]:text-white [&>button:hover]:bg-slate-700" />
        <MiniMap
          className="!bg-slate-900 !border-slate-700"
          nodeColor="#475569"
          maskColor="rgba(15,23,42,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
