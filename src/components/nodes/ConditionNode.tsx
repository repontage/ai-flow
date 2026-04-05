import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { BaseNodeData } from '../../types/nodes';

type ConditionNodeProps = NodeProps & { data: BaseNodeData };

export const ConditionNode = memo(({ data, selected }: ConditionNodeProps) => {
  const borderColor = selected ? 'border-purple-500' : 'border-slate-600';

  return (
    <div className={`bg-slate-800 border-2 ${borderColor} rounded-xl shadow-xl min-w-[180px] transition-all`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-purple-500 !border-2 !border-slate-800" />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <GitBranch size={14} className="text-purple-400" />
          </div>
          <span className="text-white font-semibold text-sm">{data.label}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="true" style={{ top: '35%' }} className="w-3 h-3 !bg-green-500 !border-2 !border-slate-800" />
      <Handle type="source" position={Position.Right} id="false" style={{ top: '65%' }} className="w-3 h-3 !bg-red-500 !border-2 !border-slate-800" />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
