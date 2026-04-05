import { useState } from 'react';
import { Search, Bot, Play, Code2, GitBranch, Monitor, ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useFlowStore } from '../../stores/flowStore';
import { WorkflowNode } from '../../types/workflow';
import { BaseNodeData, NodeCategory, NodeType } from '../../types/nodes';

interface NodeDef {
  type: NodeType;
  category: NodeCategory;
  label: string;
  description: string;
  defaultConfig: Record<string, unknown>;
}

const NODE_DEFS: NodeDef[] = [
  // Trigger
  { type: 'manualTrigger', category: 'trigger', label: '수동 트리거', description: '버튼 클릭으로 시작', defaultConfig: {} },
  { type: 'textInput', category: 'trigger', label: '텍스트 입력', description: '텍스트를 입력받아 시작', defaultConfig: { defaultValue: '' } },
  { type: 'webhookTrigger', category: 'trigger', label: 'Webhook 트리거', description: '외부 HTTP 요청으로 시작 (테스트용 페이로드)', defaultConfig: { samplePayload: '{"message":"hello","timestamp":0}' } },
  // AI
  { type: 'aiChat', category: 'ai', label: 'AI Chat', description: '프롬프트 → AI 응답', defaultConfig: { provider: 'openai', model: 'gpt-4o-mini', userPromptTemplate: '{{input}}', temperature: 0.7, maxTokens: 2048 } },
  { type: 'aiStructuredOutput', category: 'ai', label: 'AI 구조화 출력', description: 'JSON 형식으로 출력 강제', defaultConfig: { provider: 'openai', model: 'gpt-4o-mini', userPromptTemplate: '{{input}}', temperature: 0.3, maxTokens: 2048 } },
  { type: 'imageAnalysis', category: 'ai', label: '이미지 분석', description: '이미지 URL → AI 비전 분석', defaultConfig: { provider: 'openai', model: 'gpt-4o', question: '이 이미지를 상세히 설명해주세요.', maxTokens: 1024 } },
  // Transform
  { type: 'textTemplate', category: 'transform', label: '텍스트 템플릿', description: '변수를 조합해 텍스트 생성', defaultConfig: { template: '{{input}}' } },
  { type: 'textSplit', category: 'transform', label: '텍스트 분리', description: '구분자로 텍스트를 배열로 분리', defaultConfig: { delimiter: '\\n', removeEmpty: true } },
  { type: 'textMerge', category: 'transform', label: '텍스트 합치기', description: '배열 항목들을 하나의 문자열로 합침', defaultConfig: { separator: '\\n' } },
  { type: 'textReplace', category: 'transform', label: '텍스트 치환', description: '찾기/바꾸기 (정규식 지원)', defaultConfig: { find: '', replace: '', useRegex: false } },
  { type: 'textCase', category: 'transform', label: '대소문자 변환', description: '텍스트 대/소문자, camelCase 등 변환', defaultConfig: { caseType: 'upper' } },
  { type: 'numberCalc', category: 'transform', label: '숫자 계산', description: '사칙연산, 반올림 등 수학 연산', defaultConfig: { operation: 'add', operand: 0 } },
  { type: 'jsonParser', category: 'transform', label: 'JSON 파서', description: 'JSON 파싱 및 필드 추출', defaultConfig: { path: '' } },
  { type: 'csvParser', category: 'transform', label: 'CSV 파서', description: 'CSV 텍스트를 객체 배열로 변환', defaultConfig: { csvDelimiter: ',', hasHeader: true } },
  { type: 'codeNode', category: 'transform', label: '코드 실행', description: '커스텀 JavaScript 실행', defaultConfig: { code: 'return input;' } },
  { type: 'delayNode', category: 'transform', label: '딜레이', description: '지정한 시간만큼 대기 후 통과', defaultConfig: { delayMs: 1000 } },
  // Condition
  { type: 'ifElse', category: 'condition', label: 'If / Else', description: '조건 평가 후 True/False 분기', defaultConfig: { conditions: [] } },
  { type: 'switchNode', category: 'condition', label: 'Switch', description: '값에 따라 여러 경로로 분기', defaultConfig: { switchField: '{{input}}', cases: [], defaultPort: 'default' } },
  { type: 'loopNode', category: 'condition', label: '루프', description: '배열의 각 항목을 순차 처리', defaultConfig: {} },
  // Output
  { type: 'displayOutput', category: 'output', label: '결과 표시', description: '실행 로그에 결과를 표시', defaultConfig: {} },
  { type: 'clipboardOutput', category: 'output', label: '클립보드 복사', description: '결과를 클립보드에 복사', defaultConfig: {} },
  { type: 'fileSave', category: 'output', label: '파일 저장', description: '결과를 파일로 다운로드', defaultConfig: { filename: 'output.txt', mimeType: 'text/plain' } },
  { type: 'notificationOutput', category: 'output', label: '브라우저 알림', description: '결과를 브라우저 알림으로 전송', defaultConfig: { notifTitle: 'AI Flow 알림' } },
  { type: 'httpRequest', category: 'output', label: 'HTTP 요청', description: '외부 API 호출', defaultConfig: { url: '', method: 'GET' } },
];

const CATEGORY_INFO: Record<NodeCategory, { label: string; icon: LucideIcon }> = {
  trigger: { label: '트리거', icon: Play },
  ai: { label: 'AI', icon: Bot },
  transform: { label: '변환', icon: Code2 },
  condition: { label: '조건', icon: GitBranch },
  output: { label: '출력', icon: Monitor },
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

export function NodePalette() {
  const addNode = useFlowStore(s => s.addNode);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = NODE_DEFS.filter(n =>
    n.label.toLowerCase().includes(search.toLowerCase()) ||
    n.description.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<NodeCategory, NodeDef[]>>(
    (acc, node) => {
      if (!acc[node.category]) acc[node.category] = [];
      acc[node.category].push(node);
      return acc;
    },
    {} as Record<NodeCategory, NodeDef[]>
  );

  const handleDragStart = (e: React.DragEvent, def: NodeDef) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(def));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (def: NodeDef) => {
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
      position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 100 },
      data: nodeData,
    };

    addNode(node);
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="노드 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-white text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(Object.keys(grouped) as NodeCategory[]).map(category => {
          const { label, icon: Icon } = CATEGORY_INFO[category];
          const isCollapsed = collapsed[category];
          return (
            <div key={category}>
              <button
                onClick={() => setCollapsed(s => ({ ...s, [category]: !s[category] }))}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider"
              >
                <Icon size={12} />
                {label}
                <span className="ml-auto">{isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}</span>
              </button>

              {!isCollapsed && grouped[category].map(def => (
                <div
                  key={def.type}
                  draggable
                  onDragStart={e => handleDragStart(e, def)}
                  onClick={() => handleClick(def)}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-grab active:cursor-grabbing border border-slate-700 hover:border-slate-500 transition-all mb-1"
                >
                  <div className="mt-0.5">
                    <Icon size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">{def.label}</div>
                    <div className="text-slate-500 text-xs">{def.description}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
