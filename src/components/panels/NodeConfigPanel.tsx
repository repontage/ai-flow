import { useFlowStore } from '../../stores/flowStore';
import { useApiKeyStore } from '../../stores/apiKeyStore';
import { AIProvider } from '../../types/nodes';
import { PROVIDER_LABELS, DEFAULT_MODELS } from '../../lib/providers';
import { X } from 'lucide-react';

export function NodeConfigPanel() {
  const { currentWorkflow, selectedNodeId, updateNodeData, setSelectedNode } = useFlowStore();
  const { hasKey } = useApiKeyStore();

  if (!selectedNodeId || !currentWorkflow) return null;

  const node = currentWorkflow.nodes.find(n => n.id === selectedNodeId);
  if (!node) return null;

  const data = node.data;
  const config = data.config;

  const update = (key: string, value: unknown) => {
    updateNodeData(selectedNodeId, { config: { ...config, [key]: value } });
  };

  const labelClass = 'block text-slate-400 text-xs font-medium mb-1';
  const inputClass = 'w-full bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500';
  const textareaClass = `${inputClass} resize-none`;

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-white font-semibold">{data.label}</h3>
        <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <div>
          <label className={labelClass}>노드 이름</label>
          <input
            type="text"
            value={data.label}
            onChange={e => updateNodeData(selectedNodeId, { label: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Trigger: textInput */}
        {data.type === 'textInput' && (
          <div>
            <label className={labelClass}>기본 입력값</label>
            <textarea
              rows={4}
              value={(config.defaultValue as string) || ''}
              onChange={e => update('defaultValue', e.target.value)}
              className={textareaClass}
              placeholder="워크플로우 실행시 사용할 기본 텍스트..."
            />
          </div>
        )}

        {/* Trigger: webhookTrigger */}
        {data.type === 'webhookTrigger' && (
          <div>
            <label className={labelClass}>테스트용 샘플 페이로드 (JSON)</label>
            <textarea
              rows={5}
              value={(config.samplePayload as string) || ''}
              onChange={e => update('samplePayload', e.target.value)}
              className={`${textareaClass} font-mono text-xs`}
              placeholder='{"key": "value"}'
            />
            <p className="text-slate-500 text-xs mt-1">브라우저에서 실행 시 이 JSON이 입력으로 사용됩니다</p>
          </div>
        )}

        {/* AI: imageAnalysis */}
        {data.type === 'imageAnalysis' && (
          <>
            <div>
              <label className={labelClass}>이미지 URL</label>
              <input
                type="text"
                value={(config.imageUrl as string) || ''}
                onChange={e => update('imageUrl', e.target.value)}
                className={inputClass}
                placeholder="https://example.com/image.jpg (또는 {{input}})"
              />
              <p className="text-slate-500 text-xs mt-1">비워두면 이전 노드 출력을 URL로 사용</p>
            </div>
            <div>
              <label className={labelClass}>질문</label>
              <textarea
                rows={3}
                value={(config.question as string) || ''}
                onChange={e => update('question', e.target.value)}
                className={textareaClass}
                placeholder="이 이미지에서 무엇이 보이나요?"
              />
            </div>
            <div>
              <label className={labelClass}>Max Tokens</label>
              <input
                type="number"
                min={100} max={4096}
                value={(config.maxTokens as number) || 1024}
                onChange={e => update('maxTokens', parseInt(e.target.value))}
                className={inputClass}
              />
            </div>
          </>
        )}

        {/* AI nodes (chat / structured) */}
        {data.category === 'ai' && data.type !== 'imageAnalysis' && (
          <>
            <div>
              <label className={labelClass}>AI 프로바이더</label>
              <select
                value={(config.provider as string) || 'openai'}
                onChange={e => {
                  const p = e.target.value as AIProvider;
                  update('provider', p);
                  update('model', DEFAULT_MODELS[p][0] || '');
                }}
                className={inputClass}
              >
                {Object.entries(PROVIDER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {!hasKey(config.provider as AIProvider) && config.provider !== 'ollama' && (
                <p className="text-yellow-400 text-xs mt-1">설정에서 API 키를 입력하세요</p>
              )}
            </div>

            <div>
              <label className={labelClass}>모델</label>
              <select
                value={(config.model as string) || ''}
                onChange={e => update('model', e.target.value)}
                className={inputClass}
              >
                {(DEFAULT_MODELS[config.provider as AIProvider] || []).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>시스템 프롬프트</label>
              <textarea
                rows={3}
                value={(config.systemPrompt as string) || ''}
                onChange={e => update('systemPrompt', e.target.value)}
                className={textareaClass}
                placeholder="AI 역할 및 지시사항..."
              />
            </div>

            <div>
              <label className={labelClass}>사용자 프롬프트 템플릿</label>
              <textarea
                rows={5}
                value={(config.userPromptTemplate as string) || ''}
                onChange={e => update('userPromptTemplate', e.target.value)}
                className={textareaClass}
                placeholder="{{input}} 형식으로 변수 참조"
              />
              <p className="text-slate-500 text-xs mt-1">{'{{input}}, {{nodes.nodeId.output}}'} 형식 사용</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Temperature</label>
                <input
                  type="number"
                  min={0} max={2} step={0.1}
                  value={(config.temperature as number) ?? 0.7}
                  onChange={e => update('temperature', parseFloat(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Tokens</label>
                <input
                  type="number"
                  min={100} max={8000}
                  value={(config.maxTokens as number) || 2048}
                  onChange={e => update('maxTokens', parseInt(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        {/* Transform: textTemplate */}
        {data.type === 'textTemplate' && (
          <div>
            <label className={labelClass}>템플릿</label>
            <textarea
              rows={5}
              value={(config.template as string) || ''}
              onChange={e => update('template', e.target.value)}
              className={textareaClass}
              placeholder="{{input}} 변수 사용"
            />
          </div>
        )}

        {/* Transform: textSplit */}
        {data.type === 'textSplit' && (
          <>
            <div>
              <label className={labelClass}>구분자</label>
              <input
                type="text"
                value={(config.delimiter as string) || '\\n'}
                onChange={e => update('delimiter', e.target.value)}
                className={inputClass}
                placeholder="\\n (줄바꿈), , (쉼표) 등"
              />
              <p className="text-slate-500 text-xs mt-1">\n = 줄바꿈, \t = 탭</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="removeEmpty"
                checked={(config.removeEmpty as boolean) ?? true}
                onChange={e => update('removeEmpty', e.target.checked)}
                className="accent-indigo-500"
              />
              <label htmlFor="removeEmpty" className="text-slate-300 text-sm">빈 항목 제거</label>
            </div>
          </>
        )}

        {/* Transform: textMerge */}
        {data.type === 'textMerge' && (
          <div>
            <label className={labelClass}>구분자</label>
            <input
              type="text"
              value={(config.separator as string) || '\\n'}
              onChange={e => update('separator', e.target.value)}
              className={inputClass}
              placeholder="\\n (줄바꿈), , (쉼표) 등"
            />
          </div>
        )}

        {/* Transform: textReplace */}
        {data.type === 'textReplace' && (
          <>
            <div>
              <label className={labelClass}>찾기</label>
              <input
                type="text"
                value={(config.find as string) || ''}
                onChange={e => update('find', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>바꾸기</label>
              <input
                type="text"
                value={(config.replace as string) || ''}
                onChange={e => update('replace', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useRegex"
                checked={(config.useRegex as boolean) ?? false}
                onChange={e => update('useRegex', e.target.checked)}
                className="accent-indigo-500"
              />
              <label htmlFor="useRegex" className="text-slate-300 text-sm">정규식 사용</label>
            </div>
            {config.useRegex && (
              <div>
                <label className={labelClass}>정규식 플래그</label>
                <input
                  type="text"
                  value={(config.regexFlags as string) || 'g'}
                  onChange={e => update('regexFlags', e.target.value)}
                  className={inputClass}
                  placeholder="g, i, m 등"
                />
              </div>
            )}
          </>
        )}

        {/* Transform: textCase */}
        {data.type === 'textCase' && (
          <div>
            <label className={labelClass}>변환 방식</label>
            <select
              value={(config.caseType as string) || 'upper'}
              onChange={e => update('caseType', e.target.value)}
              className={inputClass}
            >
              <option value="upper">UPPER CASE (대문자)</option>
              <option value="lower">lower case (소문자)</option>
              <option value="title">Title Case (첫 글자 대문자)</option>
              <option value="camel">camelCase</option>
              <option value="snake">snake_case</option>
              <option value="trim">Trim (공백 제거)</option>
            </select>
          </div>
        )}

        {/* Transform: numberCalc */}
        {data.type === 'numberCalc' && (
          <>
            <div>
              <label className={labelClass}>연산</label>
              <select
                value={(config.operation as string) || 'add'}
                onChange={e => update('operation', e.target.value)}
                className={inputClass}
              >
                <option value="add">더하기 (+)</option>
                <option value="subtract">빼기 (-)</option>
                <option value="multiply">곱하기 (×)</option>
                <option value="divide">나누기 (÷)</option>
                <option value="modulo">나머지 (%)</option>
                <option value="power">거듭제곱 (^)</option>
                <option value="round">반올림</option>
                <option value="floor">내림</option>
                <option value="ceil">올림</option>
                <option value="abs">절댓값</option>
              </select>
            </div>
            {!['round', 'floor', 'ceil', 'abs'].includes(config.operation as string) && (
              <div>
                <label className={labelClass}>피연산자</label>
                <input
                  type="number"
                  value={(config.operand as number) ?? 0}
                  onChange={e => update('operand', parseFloat(e.target.value))}
                  className={inputClass}
                />
              </div>
            )}
          </>
        )}

        {/* Transform: jsonParser */}
        {data.type === 'jsonParser' && (
          <div>
            <label className={labelClass}>필드 경로 (선택)</label>
            <input
              type="text"
              value={(config.path as string) || ''}
              onChange={e => update('path', e.target.value)}
              className={inputClass}
              placeholder="예: result.data.text"
            />
          </div>
        )}

        {/* Transform: csvParser */}
        {data.type === 'csvParser' && (
          <>
            <div>
              <label className={labelClass}>구분자</label>
              <input
                type="text"
                value={(config.csvDelimiter as string) || ','}
                onChange={e => update('csvDelimiter', e.target.value)}
                className={inputClass}
                placeholder=","
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasHeader"
                checked={(config.hasHeader as boolean) !== false}
                onChange={e => update('hasHeader', e.target.checked)}
                className="accent-indigo-500"
              />
              <label htmlFor="hasHeader" className="text-slate-300 text-sm">첫 행을 헤더로 사용</label>
            </div>
          </>
        )}

        {/* Transform: codeNode */}
        {data.type === 'codeNode' && (
          <div>
            <label className={labelClass}>JavaScript 코드</label>
            <textarea
              rows={8}
              value={(config.code as string) || 'return input;'}
              onChange={e => update('code', e.target.value)}
              className={`${textareaClass} font-mono text-xs`}
            />
            <p className="text-slate-500 text-xs mt-1">input 변수로 이전 노드 출력에 접근</p>
          </div>
        )}

        {/* Transform: delayNode */}
        {data.type === 'delayNode' && (
          <div>
            <label className={labelClass}>대기 시간 (밀리초)</label>
            <input
              type="number"
              min={100} max={30000}
              value={(config.delayMs as number) || 1000}
              onChange={e => update('delayMs', parseInt(e.target.value))}
              className={inputClass}
            />
            <p className="text-slate-500 text-xs mt-1">1000 = 1초, 입력값은 그대로 통과됩니다</p>
          </div>
        )}

        {/* Condition: switchNode */}
        {data.type === 'switchNode' && (
          <>
            <div>
              <label className={labelClass}>비교할 값</label>
              <input
                type="text"
                value={(config.switchField as string) || '{{input}}'}
                onChange={e => update('switchField', e.target.value)}
                className={inputClass}
                placeholder="{{input}}"
              />
            </div>
            <div>
              <label className={labelClass}>케이스 목록 (JSON)</label>
              <textarea
                rows={5}
                value={JSON.stringify(config.cases || [], null, 2)}
                onChange={e => {
                  try { update('cases', JSON.parse(e.target.value)); } catch { /* ignore */ }
                }}
                className={`${textareaClass} font-mono text-xs`}
                placeholder='[{"value":"yes","port":"case1"}]'
              />
            </div>
            <div>
              <label className={labelClass}>기본 포트</label>
              <input
                type="text"
                value={(config.defaultPort as string) || 'default'}
                onChange={e => update('defaultPort', e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}

        {/* Output: httpRequest */}
        {data.type === 'httpRequest' && (
          <>
            <div>
              <label className={labelClass}>URL</label>
              <input
                type="text"
                value={(config.url as string) || ''}
                onChange={e => update('url', e.target.value)}
                className={inputClass}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label className={labelClass}>Method</label>
              <select value={(config.method as string) || 'GET'} onChange={e => update('method', e.target.value)} className={inputClass}>
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Authorization 헤더 (선택)</label>
              <input
                type="text"
                value={(config.authHeader as string) || ''}
                onChange={e => update('authHeader', e.target.value)}
                className={inputClass}
                placeholder="Bearer your-token"
              />
            </div>
          </>
        )}

        {/* Output: fileSave */}
        {data.type === 'fileSave' && (
          <>
            <div>
              <label className={labelClass}>파일 이름</label>
              <input
                type="text"
                value={(config.filename as string) || 'output.txt'}
                onChange={e => update('filename', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>MIME 타입</label>
              <select
                value={(config.mimeType as string) || 'text/plain'}
                onChange={e => update('mimeType', e.target.value)}
                className={inputClass}
              >
                <option value="text/plain">text/plain (.txt)</option>
                <option value="application/json">application/json (.json)</option>
                <option value="text/csv">text/csv (.csv)</option>
                <option value="text/html">text/html (.html)</option>
                <option value="text/markdown">text/markdown (.md)</option>
              </select>
            </div>
          </>
        )}

        {/* Output: notificationOutput */}
        {data.type === 'notificationOutput' && (
          <div>
            <label className={labelClass}>알림 제목</label>
            <input
              type="text"
              value={(config.notifTitle as string) || 'AI Flow 알림'}
              onChange={e => update('notifTitle', e.target.value)}
              className={inputClass}
            />
            <p className="text-slate-500 text-xs mt-1">알림 본문에는 이전 노드의 출력이 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
