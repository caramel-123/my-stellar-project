"use client";

import { useState, useCallback } from "react";
import {
  mintTicket,
  verifyTicket,
  clawbackTicket,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ─────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">{label}</label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input {...props} className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none" />
      </div>
    </div>
  );
}

function MethodSignature({ name, params, returns, color }: { name: string; params: string; returns?: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && <span className="ml-auto text-white/15 text-[10px]">{returns}</span>}
    </div>
  );
}

type Tab = "verify" | "mint" | "clawback";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("verify");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Verify
  const [verifyAddress, setVerifyAddress] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  // Mint
  const [mintAttendee, setMintAttendee] = useState("");
  const [mintEventName, setMintEventName] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  // Clawback
  const [clawbackAddress, setClawbackAddress] = useState("");
  const [isClawing, setIsClawing] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleVerify = useCallback(async () => {
    if (!verifyAddress.trim()) return setError("Enter a wallet address");
    setError(null); setIsVerifying(true); setVerifyResult(null);
    try {
      const result = await verifyTicket(verifyAddress.trim(), walletAddress || undefined);
      setVerifyResult(result === true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally { setIsVerifying(false); }
  }, [verifyAddress, walletAddress]);

  const handleMint = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!mintAttendee.trim() || !mintEventName.trim()) return setError("Fill in all fields");
    setError(null); setIsMinting(true); setTxStatus("Awaiting signature...");
    try {
      await mintTicket(walletAddress, mintAttendee.trim(), mintEventName.trim());
      setTxStatus("Ticket minted on-chain! 🎟️");
      setMintAttendee(""); setMintEventName("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally { setIsMinting(false); }
  }, [walletAddress, mintAttendee, mintEventName]);

  const handleClawback = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!clawbackAddress.trim()) return setError("Enter attendee wallet address");
    setError(null); setIsClawing(true); setTxStatus("Awaiting signature...");
    try {
      await clawbackTicket(walletAddress, clawbackAddress.trim());
      setTxStatus("Ticket revoked successfully ❌");
      setClawbackAddress("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally { setIsClawing(false); }
  }, [walletAddress, clawbackAddress]);

  const tabs = [
    { key: "verify" as Tab, label: "Verify", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "mint" as Tab, label: "Mint Ticket", icon: <TicketIcon />, color: "#7c6cf0" },
    { key: "clawback" as Tab, label: "Clawback", icon: <BanIcon />, color: "#f87171" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm">
          <span className="text-[#34d399]"><CheckIcon /></span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <TicketIcon />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">EventPass</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban Testnet</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setVerifyResult(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full" style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }} />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">

            {/* Verify Tab */}
            {activeTab === "verify" && (
              <div className="space-y-5">
                <MethodSignature name="verify_ticket" params="(attendee: Address)" returns="-> bool" color="#4fc3f7" />
                <Input
                  label="Attendee Wallet Address"
                  value={verifyAddress}
                  onChange={(e) => setVerifyAddress(e.target.value)}
                  placeholder="G..."
                />
                <ShimmerButton onClick={handleVerify} disabled={isVerifying} shimmerColor="#4fc3f7" className="w-full">
                  {isVerifying ? <><SpinnerIcon /> Verifying...</> : <><SearchIcon /> Verify Ticket</>}
                </ShimmerButton>

                {verifyResult !== null && (
                  <div className={cn(
                    "rounded-xl border px-5 py-4 text-center animate-fade-in-up",
                    verifyResult
                      ? "border-[#34d399]/20 bg-[#34d399]/[0.05]"
                      : "border-[#f87171]/20 bg-[#f87171]/[0.05]"
                  )}>
                    <p className={cn("text-2xl font-bold", verifyResult ? "text-[#34d399]" : "text-[#f87171]")}>
                      {verifyResult ? "✅ Valid Ticket" : "❌ No Valid Ticket"}
                    </p>
                    <p className="text-xs text-white/30 mt-1">
                      {verifyResult ? "This wallet holds a valid EventPass ticket" : "This wallet does not have a valid ticket"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mint Tab */}
            {activeTab === "mint" && (
              <div className="space-y-5">
                <MethodSignature name="mint_ticket" params="(attendee: Address, event_name: String)" color="#7c6cf0" />
                <Input
                  label="Attendee Wallet Address"
                  value={mintAttendee}
                  onChange={(e) => setMintAttendee(e.target.value)}
                  placeholder="G..."
                />
                <Input
                  label="Event Name"
                  value={mintEventName}
                  onChange={(e) => setMintEventName(e.target.value)}
                  placeholder="Python Tech Event 2026"
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleMint} disabled={isMinting} shimmerColor="#7c6cf0" className="w-full">
                    {isMinting ? <><SpinnerIcon /> Minting...</> : <><TicketIcon /> Mint Ticket</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 transition-all disabled:opacity-50"
                  >
                    Connect wallet to mint tickets
                  </button>
                )}
              </div>
            )}

            {/* Clawback Tab */}
            {activeTab === "clawback" && (
              <div className="space-y-5">
                <MethodSignature name="clawback" params="(attendee: Address)" color="#f87171" />
                <Input
                  label="Attendee Wallet Address to Revoke"
                  value={clawbackAddress}
                  onChange={(e) => setClawbackAddress(e.target.value)}
                  placeholder="G..."
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleClawback} disabled={isClawing} shimmerColor="#f87171" className="w-full">
                    {isClawing ? <><SpinnerIcon /> Revoking...</> : <><BanIcon /> Clawback Ticket</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f87171]/20 bg-[#f87171]/[0.03] py-4 text-sm text-[#f87171]/60 hover:border-[#f87171]/30 hover:text-[#f87171]/80 transition-all disabled:opacity-50"
                  >
                    Connect wallet to clawback tickets
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">EventPass · Soroban Testnet</p>
            <div className="flex items-center gap-3">
              {[
                { label: "Verify", color: "bg-[#4fc3f7]" },
                { label: "Mint", color: "bg-[#7c6cf0]" },
                { label: "Clawback", color: "bg-[#f87171]" },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1.5">
                  <span className={cn("h-1 w-1 rounded-full", s.color)} />
                  <span className="font-mono text-[9px] text-white/15">{s.label}</span>
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}