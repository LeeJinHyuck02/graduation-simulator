import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  getStoredSyncRoomId,
  saveStoredSyncRoomId,
  parseFirebaseSnippet,
  isConfiguredViaEnv,
  FirebaseConfig,
} from '../../services/firebaseClient';
import { storageAdapter } from '../../services/storageAdapter';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Flame, Download, Upload, CheckCircle2, AlertCircle, RefreshCw, Unlink, KeyRound } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const { scenarios, currentScenarioId, importScenarios, reconnectSync } = usePlannerStore();
  const currentScenario = scenarios.find((s) => s.id === currentScenarioId);

  const [rawSnippet, setRawSnippet] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [appId, setAppId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredFirebaseConfig();
      if (config) {
        setApiKey(config.apiKey);
        setProjectId(config.projectId);
        setAppId(config.appId || '');
        setIsConfigured(true);
      } else {
        setIsConfigured(false);
      }
      setRoomId(getStoredSyncRoomId());
      setStatusMessage(null);
    }
  }, [isOpen]);

  // 스니펫 붙여넣기 시 자동 감지
  const handleSnippetChange = (text: string) => {
    setRawSnippet(text);
    const parsed = parseFirebaseSnippet(text);
    if (parsed) {
      setApiKey(parsed.apiKey);
      setProjectId(parsed.projectId);
      setAppId(parsed.appId);
      setStatusMessage('Firebase 설정 스니펫이 성공적으로 파싱되었습니다! [동기화 저장 및 연결]을 누르세요.');
      setIsError(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSyncingNow(true);
    setStatusMessage('Firebase Firestore 연결 및 동기화 중...');
    setIsError(false);

    let configToSave: FirebaseConfig | null = null;
    if (apiKey.trim() && projectId.trim()) {
      configToSave = {
        apiKey: apiKey.trim(),
        projectId: projectId.trim(),
        appId: appId.trim(),
        authDomain: `${projectId.trim()}.firebaseapp.com`,
      };
    }

    if (!configToSave) {
      setStatusMessage('API Key와 Project ID를 입력하거나 설정 스니펫을 붙여넣어 주세요.');
      setIsError(true);
      setIsSyncingNow(false);
      return;
    }

    try {
      saveFirebaseConfig(configToSave);
      saveStoredSyncRoomId(roomId.trim());
      setIsConfigured(true);

      // 로컬 데이터를 클라우드에 1회 동기화 및 실시간 리스너 재구독
      await storageAdapter.saveScenarios(scenarios);
      await reconnectSync();

      setStatusMessage('🔥 Firebase 연결 성공! PC와 아이패드 간 실시간 동기화가 활성화되었습니다.');
      setIsError(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setStatusMessage(`동기화 실패: ${msg}`);
      setIsError(true);
    } finally {
      setIsSyncingNow(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Firebase 클라우드 연동을 해제하고 로컬 단독 모드로 전환하시겠습니까? (로컬 데이터는 유지됩니다)')) {
      saveFirebaseConfig(null);
      setIsConfigured(false);
      setApiKey('');
      setProjectId('');
      setAppId('');
      setRawSnippet('');
      setStatusMessage('클라우드 연동이 해제되었습니다 (로컬 브라우저 저장 모드).');
      setIsError(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = storageAdapter.parseImportJson(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        importScenarios(parsed);
        alert('전체 시나리오 데이터가 성공적으로 복원되었습니다.');
        onClose();
      } else if (parsed && typeof parsed === 'object' && 'scenarioName' in parsed) {
        importScenarios([parsed as any]);
        alert('시나리오가 성공적으로 복원되었습니다.');
        onClose();
      } else {
        alert('올바른 형식의 JSON 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="기기 간 실시간 동기화 및 백업" maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* 1. Firebase 실시간 클라우드 동기화 섹션 */}
        <div className="p-4 bg-dark-subcard/50 rounded-xl border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold">
              <Flame className="text-amber-500" size={20} />
              <span>Firebase Firestore 실시간 동기화</span>
            </div>
            {isConfigured && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                실시간 연동 중
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Google Firebase(무료)를 이용해 <strong>PC와 아이패드</strong>에서 동일한 동기화 코드로 접속하면,
            어느 한쪽에서 과목을 옮기는 즉시 다른 쪽 기기에도 <strong>실시간 반영</strong>됩니다.
          </p>

          {isConfiguredViaEnv() ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 size={16} />
                <span>환경변수로 자동 연동됨 (GitHub Secrets / .env)</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                이 웹사이트는 환경변수로 Firebase와 영구 연결되어 있습니다. 별도로 코드를 복사/붙여넣기할 필요 없이, PC와 아이패드에서 사이트를 열기만 하면 즉시 실시간 동기화됩니다.
              </p>
            </div>
          ) : (
            <>
              {/* 간편 붙여넣기 박스 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Firebase 콘솔 코드 붙여넣기 (권장: 자동 파싱)
                </label>
                <textarea
                  rows={2}
                  value={rawSnippet}
                  onChange={(e) => handleSnippetChange(e.target.value)}
                  placeholder="const firebaseConfig = { apiKey: '...', projectId: '...' }; 붙여넣기"
                  className="w-full px-3 py-2 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </>
          )}

          {/* 상세 입력 필드 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-2.5 py-1.5 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="postech-sim-xxxx"
                className="w-full px-2.5 py-1.5 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 동기화 방/식별코드 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-zinc-300">
                기기 동기화 코드 (Sync Room ID)
              </label>
              <span className="text-[10px] text-zinc-500">PC와 아이패드에 동일한 코드 입력</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KeyRound size={14} className="text-zinc-500" />
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="postech_math_plan_default"
                className="flex-1 px-2.5 py-1.5 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {statusMessage && (
            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                isError ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              }`}
            >
              {isError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveConfig}
              disabled={isSyncingNow}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncingNow ? 'animate-spin' : ''} />
              <span>동기화 저장 및 연결</span>
            </button>
            {isConfigured && (
              <button
                onClick={handleDisconnect}
                title="클라우드 연동 해제"
                className="px-3 py-2 bg-zinc-800 hover:bg-rose-950/40 border border-zinc-700 hover:border-rose-600/50 text-zinc-300 hover:text-rose-400 text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Unlink size={13} />
                <span>연동 해제</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. 파일 백업 / 복원 섹션 */}
        <div className="p-4 bg-dark-subcard/50 rounded-xl border border-dark-border space-y-3">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <Download className="text-zinc-300" size={18} />
            <span>오프라인 파일 백업 & 복원</span>
          </div>
          <p className="text-xs text-zinc-400">
            인터넷 연결 없이도 JSON 파일로 내보내거나 가져와서 데이터를 안전하게 보관할 수 있습니다.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => currentScenario && storageAdapter.exportToJson(currentScenario)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-dark-hover hover:bg-zinc-700/60 border border-dark-border text-zinc-200 text-xs rounded-lg transition-colors"
            >
              <Download size={14} />
              <span>현재 시나리오 백업</span>
            </button>
            <button
              onClick={() => storageAdapter.exportAllToJson(scenarios)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-dark-hover hover:bg-zinc-700/60 border border-dark-border text-zinc-200 text-xs rounded-lg transition-colors"
            >
              <Download size={14} />
              <span>전체 시나리오 백업</span>
            </button>
          </div>

          <label className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-dashed border-zinc-600 text-zinc-300 text-xs rounded-lg cursor-pointer transition-colors">
            <Upload size={14} />
            <span>JSON 파일에서 불러오기 (복원)</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>
      </div>
    </Modal>
  );
};
