import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend
} from 'recharts';
import { 
  AlertTriangle, Shield, ShieldCheck, Smartphone, Users, MapPin, DollarSign, Activity, 
  Layers, Bell, Radio, CheckCircle, ArrowRight, UserCheck, RefreshCw, Filter, BookOpen, Clock, AlertOctagon
} from 'lucide-react';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cases, setCases] = useState([]);
  const [liveTx, setLiveTx] = useState([]);
  const [selectedRole, setSelectedRole] = useState("OPERATIONS"); // OPERATIONS or AGENT
  const [metrics, setMetrics] = useState({ latency_ms: 22.4, precision: 98.2, false_positive_rate: 1.8 });
  const [forecast, setForecast] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // Filtering States for Operations Desk
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");

  // Escalation / Dispatch States
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationData, setEscalationData] = useState({ alert_id: "", assigned_role: "Field_Officer", current_owner: "", notes: "" });
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionData, setResolutionData] = useState({ case_id: "", notes: "" });

  const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';
  const WS_URL = window.location.hostname === 'localhost' ? 'ws://localhost:8000/ws/live-stream' : `ws://${window.location.host}/ws/live-stream`;

  // Fetch initial API states
  const fetchInitialData = () => {
    fetch(`${BACKEND_URL}/api/agents`)
      .then(res => res.json())
      .then(data => {
        setAgents(data);
      })
      .catch(err => {
        console.warn("Failed fetching agents, using local mocks:", err);
        // Fallback mock agents if backend not online
        setAgents([
          {
            "agent_id": "AGT_2026_1000",
            "area": "Gulzizar_Market_SUST",
            "physical_cash_reserve": 85000,
            "wallets": [
              { "provider_name": "bKash", "e_money_balance": 4200, "status": "ACTIVE" },
              { "provider_name": "Nagad", "e_money_balance": 52000, "status": "ACTIVE" },
              { "provider_name": "Rocket", "e_money_balance": 34000, "status": "ACTIVE" }
            ],
            "last_updated": new Date().toISOString()
          },
          {
            "agent_id": "AGT_2026_1001",
            "area": "Mirpur_A",
            "physical_cash_reserve": 110000,
            "wallets": [
              { "provider_name": "bKash", "e_money_balance": 45000, "status": "ACTIVE" },
              { "provider_name": "Nagad", "e_money_balance": 28000, "status": "ACTIVE" },
              { "provider_name": "Rocket", "e_money_balance": 12000, "status": "DELAYED" }
            ],
            "last_updated": new Date().toISOString()
          },
          {
            "agent_id": "AGT_2026_1002",
            "area": "Dhanmondi_R15",
            "physical_cash_reserve": 65000,
            "wallets": [
              { "provider_name": "bKash", "e_money_balance": 18000, "status": "ACTIVE" },
              { "provider_name": "Nagad", "e_money_balance": 14000, "status": "ACTIVE" },
              { "provider_name": "Rocket", "e_money_balance": 22000, "status": "ACTIVE" }
            ],
            "last_updated": new Date().toISOString()
          }
        ]);
      });

    fetch(`${BACKEND_URL}/api/alerts`)
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        if (data.length > 0) setSelectedAlert(data[0]);
      })
      .catch(err => {
        console.warn("Failed fetching alerts, using local mocks:", err);
        const mockAlerts = [
          {
            "alert_id": "ALT_LIQ_AGT_2026_1000_bKash_0",
            "agent_id": "AGT_2026_1000",
            "provider": "bKash",
            "alert_type": "LIQUIDITY_SHORTAGE",
            "severity": "CRITICAL",
            "evidence": { "e_money_balance": 4200, "estimated_emoney_minutes_remaining": 45 },
            "uncertainty_reason": "High cash-out transaction velocity on bKash. True positive Eid rush scenario.",
            "description": "Liquidity risk flagged for agent AGT_2026_1000 on bKash. e-Money balance depleted or under high transaction load.",
            "bangla_agent_alert": "বর্তমান লেনদেনের ধারা অনুযায়ী বিকেল ৫টা ২০ মিনিটের মধ্যে আপনার নগদ টাকা শেষ হয়ে যেতে পারে। সবচেয়ে বেশি চাপ আসছে বিকাশ ক্যাশ-আউট থেকে। নিরাপদভাবে সেবা চালু রাখতে কমপক্ষে ২০,০০০ টাকা অতিরিক্ত নগদ ব্যবস্থা করার পরামর্শ দেওয়া হচ্ছে।",
            "banglish_agent_alert": "Bortoman transaction pattern onujayi bikol 5:20 er moddhe apnar wallet e taka sesh hote pare. Sabcheye beshi cash-out bKash e hocche. Safe thakte 20,000 taka cash redi rakhun.",
            "english_operations_summary": "Hidden Provider Shortage: bKash e-money drops rapidly due to localized pre-Eid cash-out surges. Physical cash rebalancing of ৳20,000 advised.",
            "confidence_score": 94.0,
            "status": "OPEN",
            "timestamp": new Date().toISOString()
          },
          {
            "alert_id": "ALT_CIRC_0",
            "agent_id": "AGT_2026_1000",
            "provider": "Nagad",
            "alert_type": "CIRCULAR_TRADING",
            "severity": "CRITICAL",
            "evidence": { "cycle": ["017XXXX2201", "017XXXX2202", "017XXXX2203", "AGT_2026_1000"], "volume": 148500 },
            "uncertainty_reason": "High frequency cycles detected. Could be overlapping cash-in loop or standard network routing.",
            "description": "Circular Loop detected involving 4 accounts with a total velocity of ৳148,500 across Nagad.",
            "bangla_agent_alert": "সতর্কতা: আপনার আউটলেটে সন্দেহজনক লেনদেনের চক্র শনাক্ত হয়েছে। একাধিক অ্যাকাউন্টের মধ্যে একই পরিমাণ টাকা বারবার আদান-প্রদান করা হচ্ছে। এটি পর্যালোচনা করা আবশ্যক।",
            "banglish_agent_alert": "Alert: Apnar outlet e suspicious loop detected. Multiple accounts a ekoi amount bar bar transfer kora hocche. Review kora dorkar.",
            "english_operations_summary": "Circular trading ring flagged. Connected transaction path forming a closed loop with high velocity.",
            "confidence_score": 92.5,
            "status": "OPEN",
            "timestamp": new Date().toISOString()
          },
          {
            "alert_id": "ALT_LIQ_AGT_2026_1001_Rocket_1",
            "agent_id": "AGT_2026_1001",
            "provider": "Rocket",
            "alert_type": "DATA_DELAY",
            "severity": "WARNING",
            "evidence": { "status": "DELAYED" },
            "uncertainty_reason": "Rocket API communication timed out. Analytics degradation is expected.",
            "description": "Rocket API Standard Feed packet loss detected for agent AGT_2026_1001. Displayed balance might be delayed.",
            "bangla_agent_alert": "সতর্কতা: রকেট এপিআই থেকে তথ্য আসতে বিলম্ব হচ্ছে। রকেটের বর্তমান ব্যালেন্স সাময়িকভাবে সঠিক না-ও হতে পারে। অনুগ্রহ করে ম্যানুয়ালি চেক করুন।",
            "banglish_agent_alert": "Alert: Rocket API standard latency face korche. Current balance updated na-o hote pare. Manual check korun.",
            "english_operations_summary": "Data latency/packet loss on Rocket API feed. Fallback mode active.",
            "confidence_score": 60.0,
            "status": "OPEN",
            "timestamp": new Date().toISOString()
          }
        ];
        setAlerts(mockAlerts);
        setSelectedAlert(mockAlerts[0]);
      });

    fetch(`${BACKEND_URL}/api/cases`)
      .then(res => res.json())
      .then(data => setCases(data))
      .catch(err => {
        console.warn("Failed fetching cases, using local mocks:", err);
        setCases([
          {
            "case_id": "CASE_2026_44301",
            "alert_id": "ALT_LIQ_AGT_2026_1000_bKash_0",
            "assigned_role": "Field_Officer",
            "current_owner": "Officer_Habib",
            "escalation_path": ["Agent", "Field_Officer"],
            "resolution_notes": "",
            "status": "PENDING",
            "updated_at": new Date().toISOString()
          }
        ]);
      });
  };

  useEffect(() => {
    fetchInitialData();

    // 2. Establish live WebSocket stream connection
    let socket;
    try {
      socket = new WebSocket(WS_URL);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.live_transactions) {
          setLiveTx(prev => {
            const merged = [...data.live_transactions, ...prev];
            // keep last 20
            return merged.slice(0, 20);
          });
        }
        if (data.agent_liquidity_forecasts) {
          setForecast(data.agent_liquidity_forecasts);
        }
        if (data.server_metrics) {
          setMetrics(data.server_metrics);
        }
      };
      socket.onclose = () => {
        console.warn("WS disconnected, running mock live ticker locally.");
        startMockInterval();
      };
      socket.onerror = () => {
        console.warn("WS connection error, running mock live ticker locally.");
      };
    } catch(e) {
      console.warn("WS connection could not be created, using mocks.");
      startMockInterval();
    }

    // Mock Live updates generator in case API/WS is offline
    let mockInterval;
    const startMockInterval = () => {
      if (mockInterval) clearInterval(mockInterval);
      mockInterval = setInterval(() => {
        const providers = ["bKash", "Nagad", "Rocket"];
        const agentsList = ["AGT_2026_1000", "AGT_2026_1001", "AGT_2026_1002"];
        const txTypes = ["CASH_IN", "CASH_OUT"];
        
        const newTxMock = {
          "transaction_id": `TX_LIVE_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          "agent_id": agentsList[Math.floor(Math.random() * agentsList.length)],
          "sender_account": `017XXXX${Math.floor(1000 + Math.random() * 9000)}`,
          "receiver_account": `018XXXX${Math.floor(1000 + Math.random() * 9000)}`,
          "provider": providers[Math.floor(Math.random() * providers.length)],
          "amount": parseFloat((Math.random() * 15000 + 500).toFixed(2)),
          "transaction_type": txTypes[Math.floor(Math.random() * txTypes.length)],
          "timestamp": new Date().toISOString(),
          "status": "SUCCESS"
        };
        
        setLiveTx(prev => [newTxMock, ...prev].slice(0, 20));
        
        // Randomly tweak latency metrics
        setMetrics(prev => ({
          ...prev,
          latency_ms: parseFloat((15 + Math.random() * 20).toFixed(1))
        }));

        // Dynamically update simulated balance levels
        setAgents(prev => prev.map(agent => {
          if (agent.agent_id === newTxMock.agent_id) {
            const updatedWallets = agent.wallets.map(w => {
              if (w.provider_name === newTxMock.provider) {
                if (newTxMock.transaction_type === "CASH_IN") {
                  return { ...w, e_money_balance: Math.max(0, w.e_money_balance - newTxMock.amount) };
                } else {
                  return { ...w, e_money_balance: w.e_money_balance + newTxMock.amount };
                }
              }
              return w;
            });
            let updatedCash = agent.physical_cash_reserve;
            if (newTxMock.transaction_type === "CASH_IN") {
              updatedCash += newTxMock.amount;
            } else {
              updatedCash = Math.max(0, updatedCash - newTxMock.amount);
            }
            return {
              ...agent,
              wallets: updatedWallets,
              physical_cash_reserve: updatedCash,
              last_updated: new Date().toISOString()
            };
          }
          return agent;
        }));
      }, 3000);
    };

    return () => {
      if (socket) socket.close();
      if (mockInterval) clearInterval(mockInterval);
    };
  }, []);

  const handleEscalationSubmit = (e) => {
    e.preventDefault();
    fetch(`${BACKEND_URL}/api/cases/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(escalationData)
    })
      .then(res => res.json())
      .then(data => {
        // Refresh cases
        fetchInitialData();
        setIsEscalating(false);
        alert(`Successfully escalated case to ${escalationData.assigned_role}!`);
      })
      .catch(err => {
        // Fallback local update
        console.warn("Failed submitting escalation api, saving locally:", err);
        const newCase = {
          case_id: `CASE_2026_${Math.floor(10000 + Math.random() * 90000)}`,
          alert_id: escalationData.alert_id,
          assigned_role: escalationData.assigned_role,
          current_owner: escalationData.current_owner || "Field_Officer_Ahmad",
          escalation_path: ["Agent", escalationData.assigned_role],
          resolution_notes: escalationData.notes,
          status: "ACKNOWLEDGED",
          updated_at: new Date().toISOString()
        };
        setCases(prev => [newCase, ...prev]);
        setAlerts(prev => prev.map(a => a.alert_id === escalationData.alert_id ? { ...a, status: "UNDER_REVIEW" } : a));
        setIsEscalating(false);
      });
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    fetch(`${BACKEND_URL}/api/cases/resolve/${resolutionData.case_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_notes: resolutionData.notes })
    })
      .then(res => res.json())
      .then(() => {
        fetchInitialData();
        setIsResolving(false);
        alert(`Case successfully marked as RESOLVED.`);
      })
      .catch(err => {
        console.warn("Failed resolving case API, saving locally:", err);
        setCases(prev => prev.map(c => c.case_id === resolutionData.case_id ? { ...c, status: "RESOLVED", resolution_notes: resolutionData.notes } : c));
        const matchedCase = cases.find(c => c.case_id === resolutionData.case_id);
        if (matchedCase) {
          setAlerts(prev => prev.map(a => a.alert_id === matchedCase.alert_id ? { ...a, status: "RESOLVED" } : a));
        }
        setIsResolving(false);
      });
  };

  // Filtering alerts list based on selection
  const filteredAlerts = alerts.filter(a => {
    if (providerFilter !== "ALL" && a.provider !== providerFilter) return false;
    if (severityFilter !== "ALL" && a.severity !== severityFilter) return false;
    // Area filtering by joining with agent area
    if (areaFilter !== "ALL") {
      const agentObj = agents.find(ag => ag.agent_id === a.agent_id);
      if (!agentObj || agentObj.area !== areaFilter) return false;
    }
    return true;
  });

  // Calculate stats
  const totalPhysicalCash = agents.reduce((sum, a) => sum + a.physical_cash_reserve, 0);
  const totalEMoney = agents.reduce((sum, a) => sum + a.wallets.reduce((ws, w) => ws + w.e_money_balance, 0), 0);
  const openAlertsCount = alerts.filter(a => a.status === "OPEN").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-12">
      
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-rose-900/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">MFS SUPER-AGENT DECISION INTEGRITY DESK</h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-indicator"></span> Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">SUST CSE CARNIVAL 2026 | Decision Integrity Model Framework</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Metrics Panel */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono">
            <div className="px-2">
              <span className="text-slate-400">Latency:</span> <span className="text-yellow-400 font-bold">{metrics.latency_ms}ms</span>
            </div>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="px-2">
              <span className="text-slate-400">Precision:</span> <span className="text-emerald-400 font-bold">{metrics.precision}%</span>
            </div>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="px-2">
              <span className="text-slate-400">False-Positive:</span> <span className="text-rose-400 font-bold">{metrics.false_positive_rate}%</span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-1 flex w-full sm:w-auto">
            <button 
              onClick={() => setSelectedRole("AGENT")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${selectedRole === "AGENT" ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Smartphone className="w-4 h-4" />
              Agent View
            </button>
            <button 
              onClick={() => setSelectedRole("OPERATIONS")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${selectedRole === "OPERATIONS" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Operations Desk
            </button>
          </div>

          <button 
            onClick={fetchInitialData}
            title="Refresh Data Source"
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-2.5 rounded-lg transition-colors text-slate-400 hover:text-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-6 py-6 max-w-[1600px] w-full mx-auto">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-indigo-600/10 p-3 rounded-lg text-indigo-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Cash Reserve</p>
              <h3 className="text-lg font-bold text-white mt-1">৳{totalPhysicalCash.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-purple-600/10 p-3 rounded-lg text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total e-Money Position</p>
              <h3 className="text-lg font-bold text-white mt-1">৳{totalEMoney.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-rose-600/10 p-3 rounded-lg text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Threat Indicators</p>
              <h3 className="text-lg font-bold text-rose-400 mt-1">{openAlertsCount} Alerts</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-amber-600/10 p-3 rounded-lg text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Case Load</p>
              <h3 className="text-lg font-bold text-amber-400 mt-1">{cases.filter(c => c.status !== "RESOLVED").length} Pending</h3>
            </div>
          </div>
        </section>

        {/* ----------------- DUAL VIEW SWAPPER ----------------- */}
        {selectedRole === "AGENT" ? (
          
          /* ========================================================================= */
          /* ============================ 1. AGENT VIEW ============================== */
          /* ========================================================================= */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Combined Balance Drawer Monitor */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  🏪 আপনার রিটেইল ক্যাশ ড্রয়ার ও ব্যালেন্স
                </h2>

                <div className="space-y-4">
                  {/* Physical Cash */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>ভৌতিক নগদ টাকা (Physical Cash drawer)</span>
                      <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/10 font-bold uppercase tracking-wider">Shared Reserve</span>
                    </div>
                    <p className="text-3xl font-extrabold text-white mt-2">৳{agents[0]?.physical_cash_reserve.toLocaleString('en-IN') || '0'}</p>
                    <p className="text-[11px] text-slate-400 mt-2">একক ক্যাশ ড্রয়ার (সমস্ত অপারেটরের ক্যাশ-আউটের জন্য যৌথভাবে ব্যবহৃত হয়)</p>
                  </div>

                  {/* e-money splits */}
                  <div className="grid grid-cols-3 gap-3">
                    {agents[0]?.wallets.map(w => (
                      <div key={w.provider_name} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center relative">
                        {w.e_money_balance < 5000 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                        <p className={`text-xs font-bold ${w.provider_name === 'bKash' ? 'text-rose-400' : w.provider_name === 'Nagad' ? 'text-orange-400' : 'text-purple-400'}`}>{w.provider_name}</p>
                        <p className="text-sm font-extrabold text-white mt-1">৳{Math.round(w.e_money_balance).toLocaleString('en-IN')}</p>
                        <span className={`inline-block text-[9px] mt-1 px-1.5 py-0.5 rounded font-bold uppercase ${w.status === 'ACTIVE' ? 'bg-slate-900 text-slate-400' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400 font-medium">
                  <div className="flex justify-between">
                    <span>আউটলেট আইডি:</span>
                    <span className="font-mono text-slate-200">{agents[0]?.agent_id || "AGT_2026_1000"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>অবস্থান এলাকা:</span>
                    <span className="text-slate-200">{agents[0]?.area.replace(/_/g, ' ') || "Gulzizar Market SUST"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>সর্বশেষ আপডেট:</span>
                    <span className="text-slate-200">{agents[0] ? new Date(agents[0].last_updated).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Local Actions Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">সহায়তা ও হটলাইন নম্বর</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="font-semibold text-rose-400">bKash Operations</span>
                    <span className="font-mono font-bold text-slate-300">16247</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="font-semibold text-orange-400">Nagad HelpDesk</span>
                    <span className="font-mono font-bold text-slate-300">16167</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="font-semibold text-purple-400">Rocket Support</span>
                    <span className="font-mono font-bold text-slate-300">16216</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[11px] text-indigo-300 leading-relaxed">
                  ⚠️ <strong>সতর্কতা:</strong> আপনার বিকাশ বা রকেটের ওটিপি (OTP) কিংবা পিন (PIN) নম্বর কোনো অবস্থাতেই কাউকে জানাবেন না। এই ডিস্ক শুধুমাত্র সিদ্ধান্ত গ্রহণের সহায়তার জন্য, কোনো আর্থিক লেনদেন সম্পাদন করে না।
                </div>
              </div>
            </div>

            {/* Right Column: Multilingual Alerts & Warnings Banners */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Main Banner Notice in Bengali */}
              <div className="bg-gradient-to-r from-rose-950/70 to-slate-900 border border-rose-800/40 rounded-2xl p-6 shadow-2xl glow-critical">
                <div className="flex items-start gap-4">
                  <div className="bg-rose-500/20 text-rose-400 p-3 rounded-xl border border-rose-500/30">
                    <AlertTriangle className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="bg-rose-500/10 text-rose-400 text-xs px-3 py-1 rounded-full border border-rose-500/20 font-bold uppercase tracking-wider">
                        জরুরি সতর্কবার্তা (Urgent Notice)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">ID: ALT_2026_LIQ</span>
                    </div>

                    <h2 className="text-xl font-black text-white">🏪 লিকুইডিটি বা নগদ টাকার ঘাটতি ঝুঁকি</h2>
                    
                    {/* Bangla Alert text */}
                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-base text-slate-200 font-semibold leading-relaxed">
                      "বর্তমান লেনদেনের ধারা অনুযায়ী বিকেল ৫টা ২০ মিনিটের মধ্যে আপনার নগদ টাকা শেষ হয়ে যেতে পারে। সবচেয়ে বেশি চাপ আসছে বিকাশ ক্যাশ-আউট থেকে। নিরাপদভাবে সেবা চালু রাখতে কমপক্ষে ২০,০০০ টাকা অতিরিক্ত নগদ ব্যবস্থা করার পরামর্শ দেওয়া হচ্ছে।"
                    </div>

                    {/* Banglish Alert text */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">[Banglish Translation]:</h4>
                      <p className="text-sm font-medium text-slate-300 italic">
                        "Bortoman transaction pattern onujayi bikol 5:20 er moddhe apnar wallet e taka sesh hote pare. Sabcheye beshi cash-out bKash e hocche. Safe thakte 20,000 taka cash redi rakhun."
                      </p>
                    </div>

                    {/* Safe next action advisory */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">নিরাপদ পরবর্তী পদক্ষেপ (Safe Advisory Steps)</h4>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-1 font-medium">
                          <li>বিকাশ ক্যাশ-আউট লেনদেনের জন্য অতিরিক্ত ২০,০০০ টাকা ড্রয়ারে মজুদ রাখুন।</li>
                          <li>কাস্টমারদের নগদ ক্যাশ-ইন (Cash In) সেবা প্রদানের মাধ্যমে ড্রয়ার ব্যালেন্স সমন্বয় করতে পারেন।</li>
                          <li>আপনার রকেট বা নগদ ব্যালেন্স দিয়ে বিকাশ ব্যালেন্স রিচার্জ করবেন না (সীমাবদ্ধতা)।</li>
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Depletion Lead-Time Timeline chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  ⏳ আগামী ৩ ঘণ্টার লিকুইডিটি পূর্বাভাস (Liquidity Velocity Timeline)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { time: '4:00 PM', bKash: 12000, Nagad: 52000, limit: 5000 },
                        { time: '4:20 PM', bKash: 9500, Nagad: 50000, limit: 5000 },
                        { time: '4:40 PM', bKash: 7100, Nagad: 48000, limit: 5000 },
                        { time: '5:00 PM', bKash: 5300, Nagad: 45000, limit: 5000 },
                        { time: '5:20 PM', bKash: 4200, Nagad: 43000, limit: 5000 },
                        { time: '5:40 PM', bKash: 2100, Nagad: 40000, limit: 5000 },
                        { time: '6:00 PM', bKash: 800, Nagad: 38000, limit: 5000 }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorBkash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#f1f5f9' }} />
                      <Area type="monotone" dataKey="bKash" name="bKash e-Wallet BDT" stroke="#ef4444" fillOpacity={1} fill="url(#colorBkash)" strokeWidth={2} />
                      <Line type="monotone" dataKey="Nagad" name="Nagad e-Wallet BDT" stroke="#f97316" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="limit" name="Critical Balance BDT Limit" stroke="#b91c1c" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-slate-400 italic text-center mt-3">
                  *এই লিকুইডিটি মডেলটি বিগত ৬০ মিনিটের ক্যাশ-আউটের বেগের ওপর ভিত্তি করে তৈরি। উৎসবের কেনাকাটার চাপের সময় সতর্ক থাকুন।
                </p>
              </div>

            </div>

          </div>
        ) : (
          
          /* ========================================================================= */
          /* ======================== 2. OPERATIONS DESK ============================== */
          /* ========================================================================= */
          <div className="space-y-6">
            
            {/* Filters Row */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>
                
                {/* Provider Filter */}
                <select 
                  value={providerFilter} 
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Providers</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                </select>

                {/* Severity Filter */}
                <select 
                  value={severityFilter} 
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="WARNING">Warning</option>
                </select>

                {/* Area Filter */}
                <select 
                  value={areaFilter} 
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Areas</option>
                  <option value="Gulzizar_Market_SUST">Gulzizar Market SUST</option>
                  <option value="Mirpur_A">Mirpur A</option>
                  <option value="Dhanmondi_R15">Dhanmondi R15</option>
                  <option value="Zindabazar_Sylhet">Zindabazar Sylhet</option>
                </select>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Displaying <span className="text-indigo-400 font-bold">{filteredAlerts.length}</span> active anomalies
              </span>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: Anomalies List & Agent Status */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Active Alerts List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    Threat Indicators Feed
                  </h2>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {filteredAlerts.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center font-mono">No active threats detected.</p>
                    ) : (
                      filteredAlerts.map(alert => (
                        <div 
                          key={alert.alert_id}
                          onClick={() => setSelectedAlert(alert)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedAlert?.alert_id === alert.alert_id ? "bg-slate-800/80 border-indigo-500/80" : "bg-slate-950 hover:bg-slate-800/30 border-slate-800"}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${alert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {alert.alert_type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Confidence: {alert.confidence_score}%</span>
                          </div>
                          
                          <p className="text-xs font-bold text-white mt-2 truncate">Agent: {alert.agent_id} ({alert.provider})</p>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
                          
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                            <span>Status: <strong className={alert.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}>{alert.status}</strong></span>
                            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Agents Status Dashboard */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Agent Registry Status
                  </h3>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {agents.map(agent => (
                      <div key={agent.agent_id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">{agent.agent_id}</span>
                          <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {agent.area.replace(/_/g, ' ')}</span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                          {agent.wallets.map(w => (
                            <div key={w.provider_name} className="bg-slate-900 p-1.5 border border-slate-800 rounded">
                              <p className="text-slate-400 font-bold">{w.provider_name}</p>
                              <p className="text-white font-bold">৳{Math.round(w.e_money_balance)}</p>
                              <span className={w.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}>{w.status}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-900 flex justify-between text-[10px] text-slate-400">
                          <span>Drawer Cash: <strong>৳{Math.round(agent.physical_cash_reserve)}</strong></span>
                          <span>Updated: {new Date(agent.last_updated).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Center & Right Column: Explainable Alert Details & Graph Loop & Case Manager */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Explainable AI Alert Detailed Workspace */}
                {selectedAlert ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-600/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-wider">
                            {selectedAlert.alert_type}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${selectedAlert.status === 'OPEN' ? 'bg-rose-500/10 text-rose-400' : selectedAlert.status === 'UNDER_REVIEW' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {selectedAlert.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-white mt-1">Alert ID: {selectedAlert.alert_id}</h2>
                      </div>
                      
                      <div className="flex gap-2">
                        {selectedAlert.status !== "RESOLVED" && (
                          <>
                            <button 
                              onClick={() => {
                                setEscalationData({ alert_id: selectedAlert.alert_id, assigned_role: "Field_Officer", current_owner: "", notes: "" });
                                setIsEscalating(true);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Escalate/Dispatch
                            </button>
                            <button 
                              onClick={() => {
                                setResolutionData({ case_id: cases.find(c => c.alert_id === selectedAlert.alert_id)?.case_id || "", notes: "" });
                                setIsResolving(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Resolve Alert
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metadata grids */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Target Agent</span>
                        <strong className="text-slate-200">{selectedAlert.agent_id}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Provider Scope</span>
                        <strong className="text-slate-200">{selectedAlert.provider}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Confidence</span>
                        <strong className="text-emerald-400 font-bold">{selectedAlert.confidence_score}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Time Triggered</span>
                        <strong className="text-slate-200">{new Date(selectedAlert.timestamp).toLocaleTimeString()}</strong>
                      </div>
                    </div>

                    {/* Explanations tab content */}
                    <div className="space-y-4">
                      
                      {/* English Ops Summary */}
                      <div className="bg-slate-950 p-4 border-l-4 border-indigo-500 rounded-r-xl">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          Risk Operations Summary (English)
                        </h4>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed">
                          {selectedAlert.english_operations_summary || selectedAlert.description}
                        </p>
                      </div>

                      {/* Multilingual localized templates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Bangla Agent Message</span>
                          <p className="text-xs font-medium text-slate-300 leading-relaxed">
                            {selectedAlert.bangla_agent_alert || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Banglish Agent Message</span>
                          <p className="text-xs font-medium text-slate-300 italic leading-relaxed">
                            {selectedAlert.banglish_agent_alert || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Rationale and uncertainty explanations */}
                      <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-2.5 text-xs">
                        <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-rose-300 font-semibold uppercase tracking-wide block">Uncertainty Reason & False-Positive Boundaries:</strong>
                          <p className="text-slate-400 mt-1">{selectedAlert.uncertainty_reason}</p>
                        </div>
                      </div>

                      {/* Case Escalation Audit log if any */}
                      {cases.find(c => c.alert_id === selectedAlert.alert_id) && (
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            Case Coordination History & Ledger
                          </h4>
                          {(() => {
                            const c = cases.find(c => c.alert_id === selectedAlert.alert_id);
                            return (
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Case ID:</span>
                                  <span className="font-mono text-slate-200">{c.case_id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Assigned Owner:</span>
                                  <span className="text-slate-200 font-bold">{c.current_owner}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Escalation State:</span>
                                  <span className="text-slate-200 font-mono">{c.escalation_path.join(" ➔ ")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Status:</span>
                                  <span className={`font-bold ${c.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>{c.status}</span>
                                </div>
                                {c.resolution_notes && (
                                  <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded text-slate-400 italic">
                                    Notes: {c.resolution_notes}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Circular trading loop visualizer if circular anomaly */}
                      {selectedAlert.alert_type === "CIRCULAR_TRADING" && selectedAlert.evidence?.cycle && (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                            🔗 Circular Trading Network Ring (Graph Loop Visualizer)
                          </h4>
                          
                          <div className="flex flex-wrap items-center justify-center gap-4 py-3 bg-slate-900/50 rounded-lg">
                            {selectedAlert.evidence.cycle.map((acc, index) => (
                              <React.Fragment key={index}>
                                <div className="bg-slate-950 border border-slate-800 hover:border-rose-500 p-2.5 rounded-lg text-center shadow">
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Node {index + 1}</span>
                                  <span className="font-mono text-xs font-bold text-slate-200">{acc}</span>
                                </div>
                                {index < selectedAlert.evidence.cycle.length - 1 && (
                                  <ArrowRight className="w-5 h-5 text-rose-500 animate-pulse" />
                                )}
                              </React.Fragment>
                            ))}
                            <ArrowRight className="w-5 h-5 text-rose-500 animate-pulse" />
                            <div className="bg-slate-950 border-2 border-rose-500 p-2.5 rounded-lg text-center shadow">
                              <span className="text-[10px] text-rose-400 block uppercase font-bold">Target Agent</span>
                              <span className="font-mono text-xs font-bold text-slate-200">{selectedAlert.agent_id}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
                            <span>Loop Size: <strong className="text-white">{selectedAlert.evidence.cycle.length} Accounts</strong></span>
                            <span>Total Volume: <strong className="text-rose-400">৳{selectedAlert.evidence.volume?.toLocaleString('en-IN')}</strong></span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 italic shadow-xl">
                    Select an threat indicator from the feed to load compliance details.
                  </div>
                )}

                {/* Live Stream Transaction Feed Ticker */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Live Stream Transaction Ticker Feed
                  </h3>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 font-mono text-xs pr-1">
                    {liveTx.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">Awaiting simulated incoming transactions...</p>
                    ) : (
                      liveTx.map((tx, idx) => (
                        <div 
                          key={idx} 
                          className="flex justify-between items-center p-2.5 bg-slate-950 rounded border border-slate-800/80 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tx.transaction_type === 'CASH_OUT' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {tx.transaction_type}
                            </span>
                            <span className="text-slate-300 font-bold text-xs">{tx.agent_id}</span>
                          </div>
                          
                          <div className="text-[11px] text-slate-400 hidden md:block">
                            <span>{tx.sender_account} ➔ {tx.receiver_account}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-bold">{tx.provider}</span>
                            <span className="font-extrabold text-slate-200">৳{tx.amount.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* -------------------- 1. ESCALATION MODAL -------------------- */}
      {isEscalating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Escalate Case & Dispatch
            </h3>
            
            <form onSubmit={handleEscalationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Role</label>
                <select 
                  value={escalationData.assigned_role}
                  onChange={(e) => setEscalationData({ ...escalationData, assigned_role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Field_Officer">Field Officer (Thana Level)</option>
                  <option value="Operations_Team">Operations Team (Regional Manager)</option>
                  <option value="Risk_Analyst">Risk Analyst (Central Division)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Assign Owner (Name)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Officer Habib"
                  value={escalationData.current_owner}
                  onChange={(e) => setEscalationData({ ...escalationData, current_owner: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Coordination Instructions / Notes</label>
                <textarea 
                  rows="3"
                  placeholder="Provide context regarding the spike, verification criteria..."
                  value={escalationData.notes}
                  onChange={(e) => setEscalationData({ ...escalationData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEscalating(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded font-bold"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- 2. RESOLUTION MODAL -------------------- */}
      {isResolving && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Resolve Compliance Alert
            </h3>
            
            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Resolution Case Notes</label>
                <textarea 
                  rows="4"
                  required
                  placeholder="Detail the outcome of the human review. Confirm if it was a false positive or verified event..."
                  value={resolutionData.notes}
                  onChange={(e) => setResolutionData({ ...resolutionData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsResolving(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded font-bold"
                >
                  Resolve Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
