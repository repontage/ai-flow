import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { BaseNodeData } from '../../types/nodes';

type AINodeProps = NodeProps & { data: BaseNodeData };

export const AINode = memo(({ data, selected }: AINodeProps) => {
  const statusIcon = {
    idle: null,
    running: <Loader size={12} className="animate-spin text-blue-400" />,
    success: <CheckCircle size={12} className="text-green-400" />,
    error: <AlertCircle size={12} className="text-red-400" />,
  }[data.status || 'idle'];

  const borderColor = selected ? 'border-indigo-500' : 'border-slate-600';
  const statusBg = {
    idle: '',
    running: 'bg-blue-500/10',
    success: 'bg-green-500/10',
    error: 'bg-red-500/10',
  }[data.status || 'idle'];

  return (
    <div className={`bg-slate-800 border-2 ${borderColor} rounded-xl shadow-xl min-w-[200px] ${statusBg} transition-all`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-indigo-500 !border-2 !border-slate-800" />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg">
            <Bot size={14} className="text-indigo-400" />
          </div>
          <span className="text-white font-semibold text-sm">{data.label}</span>
          {statusIcon}
        </div>
        <div className="text-slate-400 text-xs">
          {data.config?.provider ? `${data.config.provider as string}` : 'AI 미설정'}
          {data.config?.model ? ` · ${data.config.model as string}` : ''}
        </div>
        {data.status === 'error' && data.error && (
          <div className="mt-2 text-red-400 text-xs truncate max-w-[180px]">{data.error}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-indigo-500 !border-2 !border-slate-800" />
    </div>
  );
});

AINode.displayName = 'AINode';
