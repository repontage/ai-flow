import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, Type } from 'lucide-react';
import { BaseNodeData } from '../../types/nodes';

type TriggerNodeProps = NodeProps & { data: BaseNodeData };

export const TriggerNode = memo(({ data, selected }: TriggerNodeProps) => {
  const isTextInput = data.type === 'textInput';
  const borderColor = selected ? 'border-green-500' : 'border-slate-600';

  return (
    <div className={`bg-slate-800 border-2 ${borderColor} rounded-xl shadow-xl min-w-[180px] transition-all`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-500/20 rounded-lg">
            {isTextInput ? <Type size={14} className="text-green-400" /> : <Play size={14} className="text-green-400" />}
          </div>
          <span className="text-white font-semibold text-sm">{data.label}</span>
        </div>
        {isTextInput && !!data.config?.defaultValue && (
          <div className="mt-2 text-slate-400 text-xs truncate max-w-[160px]">
            {String(data.config.defaultValue).substring(0, 30)}...
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-green-500 !border-2 !border-slate-800" />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
