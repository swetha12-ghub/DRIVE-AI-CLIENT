import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  ExternalLink,
  Sparkles,
  Send,
  Radio,
  FileText,
  User,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Sliders,
  Activity,
  Layers
} from 'lucide-react';
import { EvaluationReport, AssistantTone, VoiceMeetingMessage } from '../types/review';

interface VoiceMeetingCompanionProps {
  report: EvaluationReport | null;
  googleMeetLink: string;
  onViewDocument: () => void;
}

export const VoiceMeetingCompanion: React.FC<VoiceMeetingCompanionProps> = ({
  report,
  googleMeetLink,
  onViewDocument,
}) => {
  const [messages, setMessages] = useState<VoiceMeetingMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [selectedTone, setSelectedTone] = useState<AssistantTone>('Adaptive (Auto)');
  const [lastUsedTone, setLastUsedTone] = useState<AssistantTone>('Executive & Strategic');
  const [speechInterim, setSpeechInterim] = useState('');
  const [actionNotes, setActionNotes] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize meeting messages on load
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: VoiceMeetingMessage = {
        id: 'msg-0',
        sender: 'assistant',
        speakerName: 'TaskReview AI Voice Auditor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: report
          ? `Welcome to the deliverable review debrief for ${report.projectName}. I have audited all deliverables in "${report.taskFolderName}" and issued an overall score of ${report.overallScore}/100 with a verdict of ${report.verdict}. I am ready to answer any questions or walk the team through the findings.`
          : 'Welcome to the review debrief session. I am connected to the meeting room and ready to audit deliverables and provide real-time voice feedback.',
        toneUsed: 'Executive & Strategic',
      };
      setMessages([initialGreeting]);

      if (report?.mandatoryActionItems) {
        setActionNotes(report.mandatoryActionItems.map((a) => `${a.priority}: ${a.task}`));
      }
    }
  }, [report]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechInterim('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setInputText(final);
          handleSendMessage(final);
          setIsListening(false);
          setSpeechInterim('');
        } else {
          setSpeechInterim(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setSpeechInterim('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [report, selectedTone]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Cannot start recognition:', err);
      }
    }
  };

  const speakText = (text: string, audioBase64?: string) => {
    if (!speechEnabled) return;

    // 1. If Gemini TTS returned a WAV audio base64, play it directly
    if (audioBase64) {
      try {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audioPlayerRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          fallbackWebSpeech(text);
        };
        audio.play().catch(() => fallbackWebSpeech(text));
        return;
      } catch (e) {
        fallbackWebSpeech(text);
        return;
      }
    }

    // 2. Otherwise use browser Web Speech API
    fallbackWebSpeech(text);
  };

  const fallbackWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg: VoiceMeetingMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      speakerName: 'Client Reviewer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSpeechInterim('');
    setIsProcessing(true);

    try {
      const transcriptSnippet = messages.slice(-4).map((m) => `${m.speakerName}: ${m.text}`);

      const response = await fetch('/api/voice-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: textToSend,
          meetingTranscript: transcriptSnippet,
          reportContext: report || undefined,
          requestedTone: selectedTone,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: VoiceMeetingMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        speakerName: 'TaskReview AI Voice Auditor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.replyText,
        toneUsed: data.toneUsed || selectedTone,
        audioUrl: data.audioBase64,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLastUsedTone(data.toneUsed || selectedTone);

      if (data.meetingActionTriggered) {
        setActionNotes((prev) => [...prev, data.meetingActionTriggered]);
      }

      // Speak answer aloud
      speakText(data.replyText, data.audioBase64);
    } catch (err) {
      console.error('Error getting voice reply:', err);
      // Construct fallback reply
      const fallbackReply = report
        ? `Regarding ${report.projectName}: the deliverable scored ${report.overallScore}/100. Our main recommendation is to resolve the P0 action items listed in Section 5 before production sign-off.`
        : 'Deliverables meet standard quality criteria. Let me know if you would like me to review specific files or security aspects.';

      const assistantMsg: VoiceMeetingMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        speakerName: 'TaskReview AI Voice Auditor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: fallbackReply,
        toneUsed: selectedTone === 'Adaptive (Auto)' ? 'Executive & Strategic' : selectedTone,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      speakText(fallbackReply);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPrompts = [
    'Give the executive 60-second summary for stakeholders.',
    'What are the critical architectural deficiencies discovered?',
    'Which P0 action items are mandatory before sign-off?',
    'Walk through the security and environment scan findings.',
    'Why did testing score 82 instead of higher?',
  ];

  const getToneBadgeColor = (tone?: AssistantTone) => {
    switch (tone) {
      case 'Technical & Rigorous':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Constructive & Collaborative':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Urgent & Remedial':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Executive & Strategic':
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Top Banner & Google Meet Link Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Video className="h-6 w-6" />
            </div>
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                Google Meet Live Review Companion
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ACTIVE CALL SESSION
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Debrief Room:</span>
              <a
                href={googleMeetLink}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-indigo-400 hover:underline"
              >
                {googleMeetLink}
              </a>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href={googleMeetLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Open in Google Meet</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={onViewDocument}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>View 3-Page PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Google Meet Video Grid (Left) + Voice Dialogue Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated Google Meet Room Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-4">
            {/* 4-Tile Video Conference Grid */}
            <div className="grid grid-cols-2 gap-3 min-h-[360px]">
              {/* Tile 1: AI Voice Review Assistant */}
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-inner group">
                <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    AI Auditor
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                  <div
                    className={`h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white scale-110 shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-400/50'
                        : 'bg-slate-800 text-indigo-400 border border-slate-700'
                    }`}
                  >
                    <Bot className="h-10 w-10" />
                  </div>

                  {/* Audio Waveform Animation when Speaking */}
                  <div className="mt-4 flex items-center justify-center gap-1 h-6">
                    {[16, 24, 32, 20, 28, 14, 22].map((height, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-200 ${
                          isSpeaking ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{
                          height: isSpeaking ? `${height}px` : '4px',
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-xs font-bold text-white">
                    TaskReview AI Assistant
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Voice Synthesis: {isSpeaking ? 'Speaking Live...' : 'Listening in Meeting'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  <span className="flex items-center gap-1 font-mono">
                    <Activity className="h-3 w-3 text-emerald-400" />
                    Tone: {lastUsedTone}
                  </span>
                  <span className="text-slate-500">Gemini 3.8</span>
                </div>
              </div>

              {/* Tile 2: Client Reviewer (You) */}
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    You (Client)
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                  <div
                    className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-emerald-600 text-white scale-105 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-400/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <User className="h-10 w-10" />
                  </div>
                  <p className="mt-4 text-xs font-bold text-white">
                    Client Reviewer
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isListening ? 'Microphone Active (Speaking...)' : 'Microphone Ready'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  <span className="flex items-center gap-1">
                    {isListening ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Mic className="h-3 w-3 animate-pulse" /> Unmuted
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <MicOff className="h-3 w-3" /> Muted
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500">Local Stream</span>
                </div>
              </div>

              {/* Tile 3: Screen Share Preview of 3-Page Review Document */}
              <div
                onClick={onViewDocument}
                className="relative rounded-2xl bg-slate-900 border border-slate-800 p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Screen Share: 3-Page Audit Document
                  </span>
                  <span className="text-[9px] text-slate-500 group-hover:text-indigo-300">
                    Click to Open
                  </span>
                </div>

                <div className="flex-1 bg-white rounded-lg p-2.5 text-slate-900 text-[9px] overflow-hidden flex flex-col justify-between shadow">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                      <span className="font-extrabold text-[8px] text-indigo-600">TASKREVIEW AI</span>
                      <span className="text-[7px] font-bold bg-amber-100 text-amber-800 px-1 rounded">
                        {report?.verdict || 'APPROVED WITH CONDITIONS'}
                      </span>
                    </div>
                    <p className="font-bold text-[9px] line-clamp-1">{report?.projectName || 'Deliverable Submission'}</p>
                    <p className="text-[7.5px] text-slate-500 line-clamp-2 mt-0.5">
                      {report?.executiveSummary || 'Executive audit complete.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 border-t border-slate-100 pt-1 mt-1 text-[8px]">
                    <div>
                      <span className="text-slate-400 block text-[6.5px]">SCORE</span>
                      <span className="font-extrabold text-indigo-600">{report?.overallScore || 88}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[6.5px]">SCOPE</span>
                      <span className="font-extrabold text-emerald-600">{report?.scopeVerification?.completionPercentage || 92}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-2 flex items-center justify-between">
                  <span>Presented to all attendees</span>
                  <span className="text-indigo-400 group-hover:underline">Expand View</span>
                </div>
              </div>

              {/* Tile 4: Project Lead / Architecture Observer */}
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Lead Engineer
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm border border-slate-700">
                    DEV
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-300">
                    Engineering Team Lead
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Attendee • Attending Debrief
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-2">
                  <span className="flex items-center gap-1">
                    <MicOff className="h-3 w-3" /> Muted
                  </span>
                  <span>Google Meet Participant</span>
                </div>
              </div>
            </div>

            {/* Bottom Meeting Controls Bar */}
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  <span>{isListening ? 'Listening (Speak Now)' : 'Click to Speak'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                    speechEnabled
                      ? 'bg-slate-800 text-indigo-400 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                >
                  {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>

              {/* Dynamic Tone Engine Selector */}
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-indigo-400 hidden sm:block" />
                <span className="text-xs text-slate-400 hidden sm:block">Tone Mode:</span>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value as AssistantTone)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Adaptive (Auto)">Adaptive (Auto-Detect Tone)</option>
                  <option value="Executive & Strategic">Executive & Strategic</option>
                  <option value="Technical & Rigorous">Technical & Rigorous</option>
                  <option value="Constructive & Collaborative">Constructive & Collaborative</option>
                  <option value="Urgent & Remedial">Urgent & Remedial</option>
                </select>
              </div>
            </div>

            {/* Live speech interim banner */}
            {isListening && speechInterim && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <Radio className="h-4 w-4 animate-pulse text-emerald-400 flex-shrink-0" />
                <span className="italic">Hearing: "{speechInterim}"</span>
              </div>
            )}
          </div>

          {/* Action Items Tracker Discovered Live */}
          {actionNotes.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  <span>Real-Time Meeting Action Items & Sign-Off Checklist</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">{actionNotes.length} recorded</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {actionNotes.slice(0, 4).map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Conversational Transcript & Voice Controller (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Live Voice Review Transcript
                </h3>
                <p className="text-[10px] text-slate-400">
                  Adaptive context-aware response engine
                </p>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getToneBadgeColor(lastUsedTone)}`}>
              {lastUsedTone}
            </span>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-400">{msg.speakerName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.toneUsed && (
                    <span className="text-[9px] text-indigo-400 ml-1 px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {msg.toneUsed}
                    </span>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed shadow-sm relative group ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Play audio button if available */}
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => speakText(msg.text, msg.audioUrl)}
                      className="mt-2 text-[10px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
                      title="Replay Voice Audio"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Replay Speech</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400 max-w-[80%] animate-pulse">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
                <span>Auditing deliverables and analyzing tone...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {quickPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isProcessing}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700/80 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Text & Speech Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Speak question aloud"
              >
                <Mic className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? 'Listening to your voice...' : 'Ask question about review deliverables...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send query"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
