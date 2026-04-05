import { useNavigate } from 'react-router-dom';
import { Plus, Play, Edit2, Trash2, Download, Upload, FileJson, Clock, Cpu } from 'lucide-react';
import { useFlowStore } from '../stores/flowStore';
import { createTemplates } from '../data/templates';
import { useState, useRef } from 'react';

export function Dashboard() {
  const navigate = useNavigate();
  const { workflows, createWorkflow, loadWorkflow, deleteWorkflow, exportWorkflow, importWorkflow, setCurrentWorkflow } = useFlowStore();
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorkflow(newName.trim());
    navigate('/editor');
    setNewName('');
    setShowCreate(false);
  };

  const handleLoad = (id: string) => {
    loadWorkflow(id);
    navigate('/editor');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importWorkflow(file);
    e.target.value = '';
  };

  const handleLoadTemplate = (templateIdx: number) => {
    const templates = createTemplates();
    const tpl = templates[templateIdx];
    if (!tpl) return;
    setCurrentWorkflow(tpl);
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">AI Flow</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => navigate('/settings')}
          className="px-3 py-1.5 text-slate-400 hover:text-white text-sm"
        >
          설정
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">워크플로우</h1>
          <div className="flex gap-3">
            <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 text-sm"
            >
              <Upload size={14} />
              가져오기
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus size={14} />
              새 워크플로우
            </button>
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
              <h2 className="text-white font-semibold text-lg mb-4">새 워크플로우 만들기</h2>
              <input
                type="text"
                autoFocus
                placeholder="워크플로우 이름..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500 mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">취소</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">만들기</button>
              </div>
            </div>
          </div>
        )}

        {/* Workflows grid */}
        {workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {workflows.map(wf => (
              <div key={wf.id} className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{wf.name}</h3>
                      {wf.description && <p className="text-slate-400 text-sm mt-0.5">{wf.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-xs">
                    <span className="flex items-center gap-1"><Cpu size={10} />{wf.nodes.length}개 노드</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />{new Date(wf.updatedAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
                <div className="flex border-t border-slate-700">
                  <button onClick={() => handleLoad(wf.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-indigo-400 hover:bg-slate-700 text-xs rounded-bl-xl transition-colors">
                    <Edit2 size={12} />편집
                  </button>
                  <button onClick={() => { loadWorkflow(wf.id); navigate('/editor'); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-green-400 hover:bg-slate-700 text-xs transition-colors">
                    <Play size={12} />실행
                  </button>
                  <button onClick={() => exportWorkflow(wf.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-slate-400 hover:bg-slate-700 text-xs transition-colors">
                    <Download size={12} />내보내기
                  </button>
                  <button onClick={() => deleteWorkflow(wf.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-red-400 hover:bg-slate-700 text-xs rounded-br-xl transition-colors">
                    <Trash2 size={12} />삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-700 border-dashed p-12 text-center mb-12">
            <FileJson size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">아직 워크플로우가 없습니다</p>
            <p className="text-slate-600 text-sm">새 워크플로우를 만들거나 아래 템플릿으로 시작하세요</p>
          </div>
        )}

        {/* Templates */}
        <h2 className="text-lg font-semibold text-white mb-4">빠른 시작 템플릿</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'AI 문서 요약기', desc: '텍스트를 입력하면 AI가 핵심 내용을 요약합니다', nodes: ['텍스트 입력', 'AI Chat', '결과 표시'], emoji: '📄', idx: 0 },
            { title: '다국어 번역기', desc: '텍스트를 한국어·일본어로 동시에 번역합니다', nodes: ['텍스트 입력', 'AI Chat ×2', '결과 합치기'], emoji: '🌐', idx: 1 },
            { title: 'AI 코드 리뷰어', desc: '코드의 버그를 찾고 개선된 버전을 제안합니다', nodes: ['코드 입력', 'GPT 분석', 'Claude 개선'], emoji: '🔍', idx: 2 },
            { title: '이메일 초안 작성기', desc: '상황을 설명하면 전문적인 이메일을 작성합니다', nodes: ['상황 입력', 'Claude 초안', 'GPT 검토', '클립보드'], emoji: '✉️', idx: 3 },
            { title: '아이디어 브레인스토밍', desc: '주제에 대해 실용·창의·전략 아이디어를 동시에 생성합니다', nodes: ['주제 입력', 'AI ×3 병렬', '종합 결과'], emoji: '💡', idx: 4 },
            { title: '감정 분석기', desc: '텍스트의 감정을 분석하고 더 나은 표현으로 재작성합니다', nodes: ['텍스트 입력', '감정 분석', '긍정적 재작성'], emoji: '🎭', idx: 5 },
          ].map(tpl => (
            <button
              key={tpl.idx}
              onClick={() => handleLoadTemplate(tpl.idx)}
              className="bg-slate-800 rounded-xl border border-slate-700 hover:border-indigo-500 p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{tpl.emoji}</span>
                <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">{tpl.title}</h3>
              </div>
              <p className="text-slate-400 text-sm mb-3">{tpl.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {tpl.nodes.map(n => (
                  <span key={n} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{n}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
