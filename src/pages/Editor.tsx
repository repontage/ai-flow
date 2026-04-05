import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Save, Square, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { FlowCanvas } from '../components/canvas/FlowCanvas';
import { NodePalette } from '../components/panels/NodePalette';
import { NodeConfigPanel } from '../components/panels/NodeConfigPanel';
import { ExecutionPanel } from '../components/panels/ExecutionPanel';
import { useFlowStore } from '../stores/flowStore';
import { useApiKeyStore } from '../stores/apiKeyStore';
import { useExecutionStore } from '../stores/executionStore';
import { WorkflowExecutor } from '../lib/executor/WorkflowExecutor';
import { ExecutionLog } from '../types/workflow';

export function Editor() {
  const navigate = useNavigate();
  const { currentWorkflow, saveCurrentWorkflow, selectedNodeId } = useFlowStore();
  const { getAllKeys } = useApiKeyStore();
  const { setCurrentExecution, updateLog, addExecution, setRunning, isRunning, currentExecution } = useExecutionStore();
  const [logPanelOpen, setLogPanelOpen] = useState(false);
  const executorRef = useRef<WorkflowExecutor | null>(null);

  const handleRun = async () => {
    if (!currentWorkflow || isRunning) return;

    const triggerNode = currentWorkflow.nodes.find(n => n.data.category === 'trigger');
    const inputData = triggerNode?.data.config?.defaultValue || '';

    setRunning(true);
    setLogPanelOpen(true);

    const apiKeys = getAllKeys();
    const executor = new WorkflowExecutor(
      currentWorkflow,
      apiKeys,
      (log: ExecutionLog) => {
        updateLog(log);
      }
    );
    executorRef.current = executor;

    const initialExecution = {
      id: 'temp',
      workflowId: currentWorkflow.id,
      status: 'running' as const,
      startTime: Date.now(),
      logs: [],
    };
    setCurrentExecution(initialExecution);

    const result = await executor.execute(inputData);
    setCurrentExecution(result);
    addExecution(result);
    setRunning(false);
  };

  const handleStop = () => {
    executorRef.current?.abort();
    setRunning(false);
  };

  if (!currentWorkflow) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">워크플로우가 선택되지 않았습니다</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Toolbar */}
      <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm">
          <ArrowLeft size={16} />
        </button>

        <div className="w-px h-6 bg-slate-700" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-white font-medium text-sm">{currentWorkflow.name}</span>
        </div>

        <div className="flex-1" />

        <button
          onClick={saveCurrentWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600"
        >
          <Save size={14} />
          저장
        </button>

        {isRunning ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            <Square size={14} />
            중지
          </button>
        ) : (
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
          >
            <Play size={14} />
            실행
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <NodePalette />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden flex">
            <FlowCanvas />
            {selectedNodeId && <NodeConfigPanel />}
          </div>

          {/* Execution log panel */}
          <div className={`bg-slate-900 border-t border-slate-700 transition-all ${logPanelOpen ? 'h-64' : 'h-10'}`}>
            <button
              onClick={() => setLogPanelOpen(s => !s)}
              className="w-full flex items-center gap-2 px-4 h-10 text-slate-400 hover:text-white text-sm border-b border-slate-700"
            >
              {logPanelOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              실행 로그
              {currentExecution && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  currentExecution.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  currentExecution.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {currentExecution.logs.length}개 노드
                </span>
              )}
            </button>
            {logPanelOpen && (
              <div className="h-[calc(100%-40px)]">
                <ExecutionPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
