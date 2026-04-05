import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Code2, FileJson, Type, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { BaseNodeData } from '../../types/nodes';

const icons = {
  textTemplate: Type,
  jsonParser: FileJson,
  codeNode: Code2,
};

type TransformNodeProps = NodeProps & { data: BaseNodeData };

export const TransformNode = memo(({ data, selected }: TransformNodeProps) => {
  const Icon = icons[data.type as keyof typeof icons] || Code2;
  const borderColor = selected ? 'border-yellow-500' : 'border-slate-600';

  const statusIcon = {
    idle: null,
    running: <Loader size={12} className="animate-spin text-blue-400" />,
    success: <CheckCircle size={12} className="text-green-400" />,
    error: <AlertCircle size={12} className="text-red-400" />,
  }[data.status || 'idle'];

  return (
    <div className={`bg-slate-800 border-2 ${borderColor} rounded-xl shadow-xl min-w-[180px] transition-all`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-yellow-500 !border-2 !border-slate-800" />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-500/20 rounded-lg">
            <Icon size={14} className="text-yellow-400" />
          </div>
          <span className="text-white font-semibold text-sm">{data.label}</span>
          {statusIcon}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-yellow-500 !border-2 !border-slate-800" />
    </div>
  );
});

TransformNode.displayName = 'TransformNode';
