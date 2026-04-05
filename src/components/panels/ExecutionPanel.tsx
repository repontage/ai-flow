import { useState } from 'react';
import { CheckCircle, XCircle, Loader, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useExecutionStore } from '../../stores/executionStore';
import { ExecutionLog } from '../../types/workflow';

export function ExecutionPanel() {
  const { currentExecution } = useExecutionStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!currentExecution) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        워크플로우를 실행하면 로그가 여기 표시됩니다
      </div>
    );
  }

  const statusIcon = (log: ExecutionLog) => {
    if (log.status === 'running') return <Loader size={14} className="animate-spin text-blue-400" />;
    if (log.status === 'success') return <CheckCircle size={14} className="text-green-400" />;
    return <XCircle size={14} className="text-red-400" />;
  };

  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-sm">실행 로그</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          currentExecution.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
          currentExecution.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {currentExecution.status === 'running' ? '실행 중' : currentExecution.status === 'completed' ? '완료' : '실패'}
        </span>
      </div>

      {currentExecution.logs.map((log) => {
        const key = `${log.nodeId}-${log.startTime}`;
        const duration = log.endTime ? log.endTime - log.startTime : null;
        const isExpanded = expanded[key];

        return (
          <div key={key} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpanded(s => ({ ...s, [key]: !s[key] }))}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors"
            >
              {statusIcon(log)}
              <span className="text-white text-xs font-medium flex-1 text-left">{log.nodeLabel}</span>
              {duration !== null && (
                <span className="flex items-center gap-1 text-slate-500 text-xs">
                  <Clock size={10} />
                  {duration}ms
                </span>
              )}
              {isExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 space-y-2 border-t border-slate-700">
                {log.error && (
                  <div className="mt-2">
                    <div className="text-red-400 text-xs font-medium mb-1">오류</div>
                    <div className="bg-red-500/10 text-red-300 text-xs p-2 rounded font-mono">{log.error}</div>
                  </div>
                )}
                {log.output !== undefined && (
                  <div className="mt-2">
                    <div className="text-slate-400 text-xs font-medium mb-1">출력</div>
                    <pre className="bg-slate-900 text-slate-300 text-xs p-2 rounded overflow-auto max-h-40 font-mono whitespace-pre-wrap">
                      {typeof log.output === 'string' ? log.output : JSON.stringify(log.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
