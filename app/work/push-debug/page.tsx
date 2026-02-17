"use client";

import { useEffect, useState } from "react";
import { saveSubscriptionAction, getSubscriptionStatusAction } from "@/lib/actions/pwa-actions";

export default function PushDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [swStatus, setSwStatus] = useState<string>("Checking...");
  const [dbStatus, setDbStatus] = useState<string>("Checking...");
  const [vapidKey, setVapidKey] = useState<string>("");

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

  useEffect(() => {
    // Check VAPID Key visibility
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    setVapidKey(key ? `${key.substring(0, 10)}...${key.substring(key.length - 10)}` : "MISSING");
    
    // Check SW Registrations
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            setSwStatus(regs.length > 0 ? `Detected ${regs.length} SW(s)` : "No SW found");
            regs.forEach(reg => addLog(`Existing SW found: ${reg.scope} (${reg.active ? 'Active' : 'Installing'})`));
        });
    } else {
        setSwStatus("Not Supported");
    }

    // Check DB Status
    getSubscriptionStatusAction().then(res => {
        setDbStatus(res.hasSubscription ? "✅ ACTIVE in DB" : "❌ MISSING in DB");
    });

  }, []);

  const registerSW = async () => {
    try {
        addLog("Attempting to register /sw.js...");
        const reg = await navigator.serviceWorker.register("/sw.js");
        addLog(`✅ Registration Successful. Scope: ${reg.scope}`);
        setSwStatus("Registered");
    } catch (e: any) {
        addLog(`❌ Registration Failed: ${e.message}`);
    }
  };

  const nukeSW = async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
        await reg.unregister();
        addLog(`🗑️ Unregistered: ${reg.scope}`);
    }
    setSwStatus("Cleared");
    addLog("All Service Workers removed.");
  };

  const manualSubscribe = async () => {
    try {
        addLog("🚀 Starting Manual Subscription...");
        
        const reg = await navigator.serviceWorker.ready;
        addLog("Service Worker is READY.");
        
        const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!key) throw new Error("No VAPID Key in ENV");

        addLog("Converting VAPID Key...");
        const appServerKey = urlBase64ToUint8Array(key);
        
        addLog("Calling pushManager.subscribe...");
        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey
        });
        
        addLog("✅ Got Subscription Endpoint from Browser:" + sub.endpoint.substring(0, 20) + "...");
        
        addLog("Saving to Database...");
        const res = await saveSubscriptionAction(sub.toJSON());
        
        if (res.success) {
            addLog("🎉 SUCCESS: Saved to DB!");
            setDbStatus("✅ ACTIVE in DB");
        } else {
            addLog(`❌ Server Error: ${res.error}`);
        }

    } catch (e: any) {
        addLog(`❌ ERROR: ${e.message}`);
        console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">🔧 Push Notification Diagnostics</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-slate-50">
            <div className="font-bold text-slate-500">Service Worker</div>
            <div className="text-lg">{swStatus}</div>
        </div>
        <div className="p-4 border rounded bg-slate-50">
            <div className="font-bold text-slate-500">Database Status</div>
            <div className="text-lg">{dbStatus}</div>
        </div>
        <div className="p-4 border rounded bg-slate-50 col-span-2">
            <div className="font-bold text-slate-500">VAPID Key (Public)</div>
            <div className="break-all">{vapidKey}</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={registerSW} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            1. Register SW
        </button>
        <button onClick={manualSubscribe} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            2. Subscribe & Save
        </button>
        <button onClick={nukeSW} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            ⚠️ Nuke Everything
        </button>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700">
            Refresh Page
        </button>
      </div>

      <div className="p-4 bg-black text-green-400 rounded h-96 overflow-y-auto font-mono text-xs border border-gray-800">
        {logs.length === 0 && <span className="opacity-50">Waiting for actions...</span>}
        {logs.map((log, i) => (
            <div key={i} className="mb-1 border-b border-gray-900 pb-1">{log}</div>
        ))}
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
