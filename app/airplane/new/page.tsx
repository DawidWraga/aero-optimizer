'use client';

import React, { useState, useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FuelType } from '@/data/types';
import { Flame, Droplets, Zap, ShieldAlert, Factory, Thermometer, ScrollText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FailureMode {
  mode: string;
  category: string;
  cause: string;
  rank: number;
}

interface Implication {
  mode: string;
  rootCause: string;
  capability: string;
  actor: string;
  maturity: string;
  leverage: string;
}

interface PathwayResult {
  score: {
    infrastructure: number;
    regulatory: number;
    economic: number;
    scalability: number;
    technical: number;
  };
  evaluation: string;
  failures: FailureMode[];
  implications: Implication[];
}

const BASE_PATHWAY_DATA: Record<string, PathwayResult> = {
  [FuelType.LIQUID_H2]: {
    score: { infrastructure: 20, regulatory: 40, economic: 30, scalability: 50, technical: 60 },
    evaluation: "Hydrogen offers high specific energy but severe volumetric challenges. Success depends on total decoupling from current tube-and-wing architectures.",
    failures: [
      { mode: "Volumetric Efficiency Crisis", category: "Design", cause: "LH2 requires 4x the volume of kerosene for equivalent energy.", rank: 1 },
      { mode: "Liquefaction Parasitic Load", category: "Infrastructure", cause: "30% of energy content lost during liquefaction process.", rank: 2 },
      { mode: "Regulatory Safety Void", category: "Legislation", cause: "Lack of international standards for liquid H2 handling in civilian terminals.", rank: 3 },
      { mode: "Green H2 Scarcity", category: "Climate", cause: "Massive renewable energy surplus required for electrolysis scale-up.", rank: 4 }
    ],
    implications: [
      {
        mode: "Cryogenic Tank Integration",
        rootCause: "Necessity of vacuum-insulated pressure vessels within aircraft contours.",
        capability: "Advanced Composite Cryo-Storage",
        actor: "Materials Suppliers",
        maturity: "Low",
        leverage: "Determines fundamental viability of H2-powered flight range."
      }
    ]
  },
  [FuelType.SAF]: {
    score: { infrastructure: 90, regulatory: 80, economic: 50, scalability: 40, technical: 90 },
    evaluation: "SAF is the primary near-term viable pathway for long-haul aviation. The search space is heavily constrained by feedstock availability.",
    failures: [
      { mode: "Feedstock Competition", category: "Infrastructure", cause: "UCO and Tallow are heavily over-subscribed by road diesel mandates.", rank: 1 },
      { mode: "Elastomer Seal Leakage", category: "Design", cause: "Paraffinic SAF lacks the aromatics required for seal swell.", rank: 2 },
      { mode: "ILUC Accounting Gap", category: "Climate", cause: "Indirect Land Use Change (ILUC) undermines theoretical carbon savings.", rank: 3 },
      { mode: "Blending Limit Caps", category: "Legislation", cause: "ASTM D7566 currently limits many pathways to 50% max blend.", rank: 4 }
    ],
    implications: [
      {
        mode: "Synthetic Aromatic Blending",
        rootCause: "Absence of aromatics in HEFA/FT components leading to seal shrinkage.",
        capability: "Precision Synthetic Chemistry",
        actor: "Fuel Processors",
        maturity: "Medium",
        leverage: "Enables 100% SAF usage without engine modifications."
      }
    ]
  },
  [FuelType.ELECTRIC]: {
    score: { infrastructure: 60, regulatory: 70, economic: 80, scalability: 70, technical: 40 },
    evaluation: "Battery-electric flight faces a severe 'weight-penalty loop'. Focus shifts to regional hops or radical solid-state breakthroughs.",
    failures: [
      { mode: "Energy Density Wall", category: "Design", cause: "Current batteries are ~50x heavier than kerosene for same energy.", rank: 1 },
      { mode: "MW-Scale Charging Latency", category: "Infrastructure", cause: "Airport grid capacity insufficient for rapid wide-body turnaround.", rank: 2 },
      { mode: "Thermal Runaway Containment", category: "Legislation", cause: "Stringent fire containment requirements for high-voltage flight.", rank: 3 },
      { mode: "Mineral Supply Tension", category: "Climate", cause: "Lithium/Cobalt extraction carbon footprint and geopolitical risk.", rank: 4 }
    ],
    implications: [
      {
        mode: "MW-Scale Propulsion Bus",
        rootCause: "Extreme heat generation in high-voltage power distribution.",
        capability: "Superconducting Power Electronics",
        actor: "Adjacent Industries",
        maturity: "Low",
        leverage: "Unlocks ability to scale electric power to wide-body thrust requirements."
      }
    ]
  }
};

function getDynamicPathwayData(fuelType: FuelType, scenario: string, constraints: string): PathwayResult {
  const base = JSON.parse(JSON.stringify(BASE_PATHWAY_DATA[fuelType] || BASE_PATHWAY_DATA[FuelType.SAF]));
  const text = (scenario + " " + constraints).toLowerCase();
  
  // Keyword Logic: Timeframe
  if (text.includes('2045') || text.includes('2050')) {
    base.score.regulatory += 15;
    base.score.technical += 10;
    base.evaluation += " The late-century timeframe assumes significant regulatory catch-up.";
  } else if (text.includes('2025') || text.includes('2030')) {
    base.score.economic -= 20;
    base.score.technical -= 10;
    base.evaluation += " Early deployment face severe first-mover economic penalties.";
  }

  // Keyword Logic: Aircraft Class
  if (text.includes('wide-body') || text.includes('long-haul') || text.includes('trans-atlantic')) {
    if (fuelType === FuelType.ELECTRIC) {
      base.score.technical = Math.max(5, base.score.technical - 30);
      base.score.economic -= 20;
      base.evaluation = "Electric trans-atlantic wide-body is currently theoretically impossible under known physics without a 10x leap in density. " + base.evaluation;
      base.failures[0].mode = "TOTAL PAYLOAD INVERSION";
      base.failures[0].cause = "Weight of batteries required for range exceeds MTOW of any known wide-body airframe.";
    }
    if (fuelType === FuelType.LIQUID_H2) {
      base.score.infrastructure = Math.max(5, base.score.infrastructure - 15);
      base.evaluation = "Long-haul H2 requires massive fuselage volume, increasing drag by 20-30%. " + base.evaluation;
    }
  } else if (text.includes('regional') || text.includes('short-haul') || text.includes('narrow-body')) {
    if (fuelType === FuelType.ELECTRIC) {
      base.score.technical += 20;
      base.score.infrastructure += 10;
      base.evaluation = "Viability increases significantly for regional configurations where cycle frequency offsets initial battery cost. " + base.evaluation;
    }
  }

  // Keyword Logic: Systemic Constraints
  if (text.includes('subsidy') || text.includes('policy') || text.includes('mandate')) {
    base.score.economic += 15;
    base.score.regulatory += 5;
  }
  
  if (text.includes('scarce') || text.includes('limited') || text.includes('competition')) {
    base.score.scalability = Math.max(10, base.score.scalability - 25);
    base.failures[0].rank = 1;
    if (fuelType === FuelType.SAF) {
      base.failures[0].mode = "FEEDSTOCK CRUNCH (EXTREME)";
    }
  }

  // Cap scores at 100
  Object.keys(base.score).forEach(key => {
    base.score[key as keyof typeof base.score] = Math.min(100, Math.max(0, base.score[key as keyof typeof base.score]));
  });

  return base;
}

export default function NewAirplanePage() {
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.SAF);
  const [scenario, setScenario] = useState('');
  const [constraints, setConstraints] = useState('');
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PathwayResult | null>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const dynamicResult = getDynamicPathwayData(fuelType, scenario, constraints);
      setAnalysisResult(dynamicResult);
      setIsAnalyzing(false);
      setIsAnalyzed(true);
    }, 800);
  };

  const chartData = useMemo(() => {
    if (!analysisResult) return [];
    return [
      { subject: 'Infra Ease', A: analysisResult.score.infrastructure },
      { subject: 'Regulatory', A: analysisResult.score.regulatory },
      { subject: 'Economic', A: analysisResult.score.economic },
      { subject: 'Scalability', A: analysisResult.score.scalability },
      { subject: 'Tech Ready', A: analysisResult.score.technical },
    ];
  }, [analysisResult]);

  return (
    <div className="min-h-screen bg-aero-900 text-slate-300 font-mono p-4 md:p-8 overflow-y-auto selection:bg-aero-neon selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-aero-700 pb-6">
          <h1 className="text-white text-xl font-bold tracking-tight uppercase flex items-center gap-2">
            <ShieldAlert className="text-aero-neon w-5 h-5" />
            Pathway Screening Tool
          </h1>
          <p className="text-[10px] text-slate-500 mt-2 tracking-widest">
            SYSTEMIC EVALUATION // OPERATIONAL SCENARIO DISCOVERY
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs Section */}
          <div className="lg:col-span-1 space-y-6 relative z-20">
            <div className="space-y-4">
              <Label className="text-aero-neon uppercase text-[10px] tracking-widest font-bold">Select Propulsion Pathway</Label>
              <div className="flex gap-1 p-1 bg-black/40 border border-aero-700 rounded-lg">
                {[FuelType.SAF, FuelType.LIQUID_H2, FuelType.ELECTRIC].map((ft) => (
                  <button
                    key={ft}
                    onClick={() => { setFuelType(ft); setIsAnalyzed(false); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-1 text-[9px] uppercase font-bold transition-all rounded-md cursor-pointer outline-none",
                      fuelType === ft 
                        ? "bg-aero-neon text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {ft === FuelType.SAF && <Flame className="w-3 h-3" />}
                    {ft === FuelType.LIQUID_H2 && <Droplets className="w-3 h-3" />}
                    {ft === FuelType.ELECTRIC && <Zap className="w-3 h-3" />}
                    {ft.replace('liquid-', '')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 uppercase text-[10px] font-bold">Operational Scenario</Label>
              <Textarea 
                placeholder="e.g. Trans-Atlantic wide-body, 2045 entry-into-service..." 
                className="bg-black/20 border-aero-700 text-xs min-h-[100px] focus:border-aero-neon transition-colors"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 uppercase text-[10px] font-bold">Systemic Constraints (Optional)</Label>
              <Textarea 
                placeholder="e.g. Carbon-neutral airport mandates, limited green hydrogen subsidy..." 
                className="bg-black/20 border-aero-700 text-xs min-h-[80px] focus:border-aero-neon transition-colors"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
              />
            </div>

            <Button 
              className={cn(
                "w-full font-bold uppercase tracking-widest transition-all h-12 cursor-pointer border-none shadow-lg",
                isAnalyzing ? "bg-aero-700 text-slate-400" : "bg-aero-neon text-black hover:bg-white active:scale-[0.97]"
              )}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing
                </span>
              ) : "Analyze Pathway"}
            </Button>
          </div>

          {/* Results Section */}
          <div className={cn(
            "lg:col-span-2 space-y-8 transition-all duration-700",
            isAnalyzed && analysisResult ? "opacity-100 translate-y-0" : "opacity-10 translate-y-4 pointer-events-none"
          )}>
            {analysisResult && (
              <>
                <Card className="bg-black/40 border-aero-700 rounded-sm overflow-hidden">
                  <CardHeader className="border-b border-aero-700/50 pb-4 bg-aero-800/20">
                    <CardTitle className="text-aero-neon text-sm uppercase flex justify-between items-center">
                      Pathwise Evaluation
                      <Badge variant="outline" className="border-aero-neon text-aero-neon text-[9px] font-mono">ID: {fuelType.toUpperCase()}-SCREEN</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-xs leading-relaxed space-y-4">
                      <p className="text-slate-100 text-[13px]">{analysisResult.evaluation}</p>
                      <div className="p-3 bg-aero-neon/5 border border-aero-neon/20 rounded text-slate-400 italic text-[11px]">
                        Analysis dynamically generated for "{scenario || "baseline scenario"}" with identified systemic constraints.
                      </div>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                          <PolarGrid stroke="#1e3a5f" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                          <Radar
                            name="Pathway"
                            dataKey="A"
                            stroke="#22d3ee"
                            fill="#22d3ee"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="space-y-4">
                    <h3 className="text-white text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                      <ShieldAlert className="w-4 h-4 text-red-500" /> Ranked Failure Modes
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.failures.map((f, i) => (
                        <div key={i} className="bg-aero-800/30 border border-aero-700 p-3 rounded-sm relative overflow-hidden group hover:border-red-500/50 transition-colors">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-white font-bold">{f.mode}</span>
                            <Badge className="text-[8px] h-4 bg-red-950 text-red-400 border-red-900 px-1 uppercase tracking-tighter">{f.category}</Badge>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">{f.cause}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-white text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                      <Factory className="w-4 h-4 text-aero-neon" /> Supplier Implications
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.implications.map((imp, i) => (
                        <div key={i} className="bg-aero-800/30 border border-aero-700 p-3 rounded-sm space-y-3 group hover:border-aero-neon/50 transition-colors">
                          <div>
                            <span className="text-slate-500 text-[9px] uppercase block font-bold mb-1">Required Capability</span>
                            <span className="text-slate-100 text-[10px] italic">{imp.capability}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[9px]">
                            <div>
                              <span className="text-slate-500 uppercase block font-bold mb-0.5">Actor Type</span>
                              <span className="text-slate-300">{imp.actor}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 uppercase block font-bold mb-0.5">Maturity</span>
                              <span className={cn(
                                imp.maturity === 'Low' ? 'text-red-400' : 'text-yellow-400',
                                "font-bold"
                              )}>{imp.maturity.toUpperCase()}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-aero-neon text-[9px] uppercase block font-bold mb-1">Strategic Leverage</span>
                            <p className="text-[9px] text-slate-400 leading-snug">{imp.leverage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>

        {isAnalyzed && analysisResult && (
          <footer className="bg-aero-800/30 border border-aero-700 p-8 rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h3 className="text-white text-xs font-bold uppercase mb-8 text-center tracking-[0.2em]">Ecosystem Discovery Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-[11px] leading-relaxed max-w-4xl mx-auto">
              <div className="space-y-3">
                <span className="text-aero-neon font-bold block uppercase flex items-center gap-2">
                  <Factory className="w-3 h-3" /> Where to Invest
                </span>
                <p className="text-slate-400">Narrows effort to {fuelType === FuelType.LIQUID_H2 ? "cryogenic supply chains and vacuum-insulated storage systems" : fuelType === FuelType.SAF ? "synthetic aromatic production and high-purity non-fossil carbon sources" : "high-density solid-state battery manufacturing and mineral security"}.</p>
              </div>
              <div className="space-y-3 border-aero-700 md:border-x md:px-8">
                <span className="text-aero-neon font-bold block uppercase flex items-center gap-2">
                  <Thermometer className="w-3 h-3" /> What to Prototype
                </span>
                <p className="text-slate-400">Prioritize {fuelType === FuelType.LIQUID_H2 ? "multi-walled composite tanks with micro-crack detection" : fuelType === FuelType.SAF ? "on-site spectroscopic blending and real-time certification tools" : "MW-scale superconducting power electronics and thermal management"}.</p>
              </div>
              <div className="space-y-3">
                <span className="text-aero-neon font-bold block uppercase flex items-center gap-2">
                  <ScrollText className="w-3 h-3" /> Critical Gaps
                </span>
                <p className="text-slate-400">Primary coordination required between {fuelType === FuelType.LIQUID_H2 ? "civilian aviation regulators and cryogenic infrastructure operators" : fuelType === FuelType.SAF ? "agricultural feedstock owners and industrial chemical refiners" : "airport grid operators and electric propulsion OEMs"}.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
