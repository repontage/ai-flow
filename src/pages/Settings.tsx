import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu } from 'lucide-react';
import { ApiKeyPanel } from '../components/panels/ApiKeyPanel';

export function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Cpu size={14} />
          </div>
          <span className="text-white font-bold">AI Flow</span>
        </div>
        <span className="text-slate-500">/</span>
        <span className="text-white font-medium">설정</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold mb-2">API 키 관리</h1>
        <p className="text-slate-400 text-sm mb-6">
          API 키는 브라우저 로컬 스토리지에만 저장되며, 서버로 전송되지 않습니다.
        </p>
        <ApiKeyPanel />

        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="text-blue-400 font-medium mb-1 text-sm">보안 안내</h3>
          <p className="text-blue-300/70 text-xs leading-relaxed">
            API 키는 귀하의 브라우저 localStorage에만 저장됩니다.
            서버나 외부로 전송되지 않으며, AI API 호출 시에만 메모리에서 사용됩니다.
            공유 컴퓨터에서는 사용 후 키를 삭제하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
