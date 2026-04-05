import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Monitor, Clipboard, Globe, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { BaseNodeData } from '../../types/nodes';

const icons = {
  displayOutput: Monitor,
  clipboardOutput: Clipboard,
  httpRequest: Globe,
};

type OutputNodeProps = NodeProps & { data: BaseNodeData };

export const OutputNode = memo(({ data, selected }: OutputNodeProps) => {
  const Icon = icons[data.type as keyof typeof icons] || Monitor;
  const borderColor = selected ? 'border-pink-500' : 'border-slate-600';

  const statusIcon = {
    idle: null,
    running: <Loader size={12} className="animate-spin text-blue-400" />,
    success: <CheckCircle size={12} className="text-green-400" />,
    error: <AlertCircle size={12} className="text-red-400" />,
  }[data.status || 'idle'];

  return (
    <div className={`bg-slate-800 border-2 ${borderColor} rounded-xl shadow-xl min-w-[180px] transition-all`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-pink-500 !border-2 !border-slate-800" />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-pink-500/20 rounded-lg">
            <Icon size={14} className="text-pink-400" />
          </div>
          <span className="text-white font-semibold text-sm">{data.label}</span>
          {statusIcon}
        </div>
        {data.status === 'success' && data.lastOutput != null && (
          <div className="mt-2 text-green-400 text-xs truncate max-w-[160px]">
            {typeof data.lastOutput === 'string'
              ? (data.lastOutput as string).substring(0, 40)
              : JSON.stringify(data.lastOutput).substring(0, 40)}
          </div>
        )}
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';
