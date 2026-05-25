import { useState, useEffect, useCallback, useReducer } from 'react';

// ═══════════════════════════════════════════════════════════════
// GAME DATA & CONSTANTS
// ═══════════════════════════════════════════════════════════════

const BACKGROUNDS = [
  { id: 'pm', title: 'Ex-FAANG Product Manager', emoji: '📊', buff: '+20% Product-Market Fit Analysis', buffKey: 'pmf', buffValue: 0.2, desc: 'You spent 8 years shipping products to billions. You can smell PMF from a mile away.' },
  { id: 'growth', title: 'Growth Hacker', emoji: '🚀', buff: '+25% User Acquisition Boost', buffKey: 'growth', buffValue: 0.25, desc: 'You scaled 3 startups from 0 to 10M users. Growth is your religion.' },
  { id: 'architect', title: 'Software Architect', emoji: '🏗️', buff: '+30% Technical Feasibility Vetting', buffKey: 'tech', buffValue: 0.3, desc: 'You designed distributed systems at scale. No founder can BS you on tech.' },
];

const SECTORS = ['AI', 'BioTech', 'FinTech', 'Web3', 'SaaS', 'CleanTech'];


const FOUNDER_TAGS = [
  'Arrogant Genius', 'Charismatic Salesman', 'Anxious Engineer',
  'Serial Entrepreneur', 'Academic Researcher', 'Hustler Dropout',
  'Quiet Visionary', 'Hype Machine', 'Technical Purist', 'Domain Expert'
];

const STARTUP_NAMES_PREFIX = ['Nova', 'Quantum', 'Hyper', 'Meta', 'Neo', 'Synth', 'Flux', 'Aero', 'Cyber', 'Deep', 'Omni', 'Pulse', 'Nexus', 'Velo', 'Helix'];
const STARTUP_NAMES_SUFFIX = ['Labs', 'AI', 'Systems', 'Protocol', 'Health', 'Finance', 'Chain', 'Cloud', 'Wave', 'Logic', 'Core', 'Forge', 'Link', 'Dynamics', 'Stack'];

const PITCH_TEMPLATES = {
  AI: ['An AI copilot that writes legal contracts in 30 seconds', 'Generative AI for personalized education at scale', 'AI-powered drug discovery reducing R&D time by 80%', 'An autonomous AI agent for enterprise sales outreach'],
  BioTech: ['CRISPR-based gene therapy for rare diseases', 'Synthetic biology platform for sustainable materials', 'AI-accelerated protein folding for pharma', 'Personalized microbiome therapeutics'],
  FinTech: ['Decentralized credit scoring using alternative data', 'Embedded finance API for B2B marketplaces', 'AI-driven treasury management for SMBs', 'Cross-border instant settlement network'],
  Web3: ['Zero-knowledge proof identity verification', 'Decentralized social graph protocol', 'NFT-based intellectual property licensing', 'DAO governance tooling for enterprises'],
  SaaS: ['Vertical SaaS for construction project management', 'AI-native CRM that writes its own workflows', 'Developer productivity analytics platform', 'No-code enterprise automation engine'],
  CleanTech: ['Solid-state battery tech for grid storage', 'Carbon capture marketplace and verification', 'AI-optimized smart grid management', 'Hydrogen fuel cell logistics platform'],
};


const FOUNDER_RESPONSES = {
  'Arrogant Genius': {
    moat: "Our tech is 5 years ahead of anyone. If you don't see that, maybe this isn't the right fit.",
    acquisition: "Users will come to us. We don't chase customers, they chase innovation.",
    burn: "We burn cash because we move fast. Slow burn means slow death in our space.",
    honest: 0.6
  },
  'Charismatic Salesman': {
    moat: "We've locked in 3 Fortune 500 pilots and our NPS is off the charts. The market loves us.",
    acquisition: "I've personally closed our first 50 enterprise deals. Relationships are our moat.",
    burn: "Every dollar is an investment in growth. We're actually capital-efficient relative to peers.",
    honest: 0.4
  },
  'Anxious Engineer': {
    moat: "Honestly, I worry about this every night. But our patent portfolio gives us 18 months head start.",
    acquisition: "We... we're still figuring that out. But the tech is solid, I promise.",
    burn: "I know it looks high. We hired too fast. I'm working on fixing it.",
    honest: 0.85
  },
  'Serial Entrepreneur': {
    moat: "My last company had the same question at this stage. We built network effects that compounded. Same playbook here.",
    acquisition: "I've done this 3 times. Community-led growth with enterprise upsell. Works every time.",
    burn: "Lean team, focused roadmap. We'll hit default alive in 8 months.",
    honest: 0.7
  },
  'Academic Researcher': {
    moat: "12 peer-reviewed papers and 3 patents pending. This is 10 years of research commercialized.",
    acquisition: "We're partnering with research hospitals and universities for initial distribution.",
    burn: "R&D is expensive but we're methodical. Each experiment is hypothesis-driven.",
    honest: 0.8
  },
  'Hustler Dropout': {
    moat: "Speed. We ship every week. By the time someone copies us, we're 3 features ahead.",
    acquisition: "TikTok virality + community. We already have 50K waitlist from a single tweet.",
    burn: "Low. It's me, my cofounder, and 2 devs. We're scrappy as hell.",
    honest: 0.5
  },
  'Quiet Visionary': {
    moat: "The insight is non-obvious. Most people won't get it for 2-3 years. That's our moat.",
    acquisition: "We're building for a market that doesn't fully exist yet. Early adopters find us.",
    burn: "Minimal. We're patient. We'll wait for the market to come to us.",
    honest: 0.75
  },
  'Hype Machine': {
    moat: "We're THE platform for this space. Every major influencer is talking about us.",
    acquisition: "Viral loops, baby! Every user invites 5 friends. It's exponential.",
    burn: "We're investing in brand. Brand is everything in consumer. Trust the process.",
    honest: 0.25
  },
  'Technical Purist': {
    moat: "Our architecture is fundamentally different. We rebuilt from first principles.",
    acquisition: "Developer community. Open-source core with enterprise premium.",
    burn: "Engineering is our only cost. No marketing fluff. Pure product.",
    honest: 0.7
  },
  'Domain Expert': {
    moat: "20 years in this industry. I know every pain point. Competitors are outsiders guessing.",
    acquisition: "My network IS the customer base. 40% of the market knows me personally.",
    burn: "Industry standard. But our unit economics are 3x better than anyone.",
    honest: 0.65
  },
};


const QUESTIONS = [
  { id: 'moat', text: 'What is your defensible moat?' },
  { id: 'acquisition', text: 'How will you handle customer acquisition?' },
  { id: 'burn', text: 'Why is your burn rate so high?' },
];

const VALUE_ADD_ACTIONS = [
  { id: 'client', label: 'Introduce to Big Client', effect: 'revenue', power: 0.3 },
  { id: 'recruit', label: 'Help Recruit a CTO', effect: 'team', power: 0.25 },
  { id: 'press', label: 'Get Press Coverage', effect: 'growth', power: 0.2 },
  { id: 'advisor', label: 'Connect with Industry Advisor', effect: 'strategy', power: 0.15 },
];

const MARKET_CYCLES = [
  { name: 'AI Hype Peak', sector: 'AI', multiplier: 2.0, desc: 'Everyone wants AI. Valuations exploding.' },
  { name: 'Crypto Winter', sector: 'Web3', multiplier: 0.4, desc: 'Regulatory crackdown. Web3 freezing.' },
  { name: 'BioTech Boom', sector: 'BioTech', multiplier: 1.8, desc: 'FDA fast-tracks. BioTech thriving.' },
  { name: 'FinTech Correction', sector: 'FinTech', multiplier: 0.6, desc: 'Bank partnerships dry up.' },
  { name: 'SaaS Renaissance', sector: 'SaaS', multiplier: 1.5, desc: 'Enterprise spending rebounds hard.' },
  { name: 'CleanTech Policy Push', sector: 'CleanTech', multiplier: 1.7, desc: 'Government subsidies flood in.' },
  { name: 'General Bull Market', sector: 'all', multiplier: 1.3, desc: 'Everything is up. Risk appetite high.' },
  { name: 'Market Crash', sector: 'all', multiplier: 0.5, desc: 'Black swan event. Panic everywhere.' },
  { name: 'Neutral Market', sector: 'all', multiplier: 1.0, desc: 'Steady state. No major shifts.' },
];

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const formatMoney = (n) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));


// ═══════════════════════════════════════════════════════════════
// STARTUP GENERATOR
// ═══════════════════════════════════════════════════════════════

function generateStartup() {
  const sector = pick(SECTORS);
  const name = `${pick(STARTUP_NAMES_PREFIX)}${pick(STARTUP_NAMES_SUFFIX)}`;
  const founderTag = pick(FOUNDER_TAGS);
  const requestedCapital = rand(50, 500) * 1000;
  const preMoneyVal = rand(2, 20) * 1000000;
  const pitch = pick(PITCH_TEMPLATES[sector]);
  const baseQuality = Math.random(); // 0-1, hidden quality score
  const founderHonesty = FOUNDER_RESPONSES[founderTag]?.honest || 0.5;
  
  return {
    id: `${name}-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
    name,
    sector,
    founderTag,
    requestedCapital,
    preMoneyValuation: preMoneyVal,
    pitch,
    baseQuality,
    founderHonesty,
    // These evolve over time once invested
    currentValuation: preMoneyVal,
    runway: rand(12, 24), // months
    growthRate: (baseQuality * 0.3) + (Math.random() * 0.2) - 0.05,
    alive: true,
    pivoted: false,
    exited: false,
    yearsSinceValueAdd: 0,
    roundsRaised: 0,
    seriesTriggered: false,
  };
}

function generateDealFlow() {
  return [generateStartup(), generateStartup(), generateStartup()];
}


// ═══════════════════════════════════════════════════════════════
// GAME STATE REDUCER
// ═══════════════════════════════════════════════════════════════

const initialGameState = {
  phase: 'splash', // splash, profile, playing
  background: null,
  year: 2024,
  quarter: 1,
  cash: 500000,
  totalInvested: 0,
  reputation: 10,
  network: 'Local Tech Hub',
  portfolio: [], // invested startups with equity info
  dealFlow: [],
  activeTab: 'deals',
  dialogue: null, // { startup, messages, questionsAsked }
  events: [], // queue of events to show
  currentEvent: null,
  seriesRound: null, // active series round negotiation
  marketCycle: MARKET_CYCLES[8], // starts neutral
  interestRate: 5.5,
  hypeIndex: 50, // 0-100
  log: [], // transaction log
  gameOver: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SELECT_BACKGROUND':
      return { ...state, background: action.payload, phase: 'playing', dealFlow: generateDealFlow() };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'REJECT_DEAL': {
      const newDeals = state.dealFlow.filter(d => d.id !== action.payload);
      return { ...state, dealFlow: newDeals };
    }
    case 'START_DIALOGUE': {
      const startup = state.dealFlow.find(d => d.id === action.payload);
      return { ...state, dialogue: { startup, messages: [{ from: 'founder', text: `Hey! Thanks for taking the time. Let me tell you about ${startup.name}. ${startup.pitch}. We're raising ${formatMoney(startup.requestedCapital)} at a ${formatMoney(startup.preMoneyValuation)} pre-money valuation. I'd love to answer any questions you have.` }], questionsAsked: 0 } };
    }
    case 'ASK_QUESTION': {
      const { questionId } = action.payload;
      const d = state.dialogue;
      const tag = d.startup.founderTag;
      const response = FOUNDER_RESPONSES[tag]?.[questionId] || "That's a great question. Let me think about how to frame this...";
      const question = QUESTIONS.find(q => q.id === questionId);
      return { ...state, dialogue: { ...d, questionsAsked: d.questionsAsked + 1, messages: [...d.messages, { from: 'player', text: question.text }, { from: 'founder', text: response }] } };
    }
    case 'CLOSE_DIALOGUE':
      return { ...state, dialogue: null };

    case 'INVEST': {
      const startup = state.dealFlow.find(d => d.id === action.payload);
      if (!startup || state.cash < startup.requestedCapital) return state;
      const postMoney = startup.preMoneyValuation + startup.requestedCapital;
      const equity = (startup.requestedCapital / postMoney) * 100;
      const investment = {
        ...startup,
        equityPercent: equity,
        initialCheck: startup.requestedCapital,
        investedQuarter: state.quarter,
        investedYear: state.year,
        valueAddUsedThisYear: false,
      };
      return {
        ...state,
        cash: state.cash - startup.requestedCapital,
        totalInvested: state.totalInvested + startup.requestedCapital,
        portfolio: [...state.portfolio, investment],
        dealFlow: state.dealFlow.filter(d => d.id !== action.payload),
        reputation: clamp(state.reputation + 2, 0, 100),
        log: [...state.log, { year: state.year, quarter: state.quarter, type: 'invest', text: `Invested ${formatMoney(startup.requestedCapital)} in ${startup.name} for ${equity.toFixed(1)}% equity` }],
      };
    }
    case 'VALUE_ADD': {
      const { startupId, actionType } = action.payload;
      const portfolio = state.portfolio.map(s => {
        if (s.id === startupId && !s.valueAddUsedThisYear) {
          const boost = VALUE_ADD_ACTIONS.find(a => a.id === actionType)?.power || 0.15;
          return { ...s, growthRate: s.growthRate + boost, valueAddUsedThisYear: true, runway: s.runway + 3 };
        }
        return s;
      });
      return { ...state, portfolio, reputation: clamp(state.reputation + 1, 0, 100) };
    }

    case 'PRO_RATA': {
      const round = state.seriesRound;
      if (!round || state.cash < round.proRataCost) return state;
      const portfolio = state.portfolio.map(s => {
        if (s.id === round.startupId) {
          return { ...s, currentValuation: round.newValuation, roundsRaised: s.roundsRaised + 1, runway: s.runway + 18 };
        }
        return s;
      });
      return {
        ...state,
        cash: state.cash - round.proRataCost,
        totalInvested: state.totalInvested + round.proRataCost,
        portfolio,
        seriesRound: null,
        log: [...state.log, { year: state.year, quarter: state.quarter, type: 'prorata', text: `Pro-rata in ${round.startupName}: ${formatMoney(round.proRataCost)} to maintain ${round.currentEquity.toFixed(1)}%` }],
      };
    }
    case 'ACCEPT_DILUTION': {
      const round = state.seriesRound;
      if (!round) return state;
      const dilutionFactor = round.dilutionFactor;
      const portfolio = state.portfolio.map(s => {
        if (s.id === round.startupId) {
          return { ...s, equityPercent: s.equityPercent * dilutionFactor, currentValuation: round.newValuation, roundsRaised: s.roundsRaised + 1, runway: s.runway + 18 };
        }
        return s;
      });
      return {
        ...state,
        portfolio,
        seriesRound: null,
        log: [...state.log, { year: state.year, quarter: state.quarter, type: 'dilution', text: `Accepted dilution in ${round.startupName}: ${round.currentEquity.toFixed(1)}% → ${(round.currentEquity * dilutionFactor).toFixed(1)}%` }],
      };
    }
    case 'SECONDARY_EXIT': {
      const round = state.seriesRound;
      if (!round) return state;
      const exitValue = (round.currentEquity / 100) * round.newValuation;
      const portfolio = state.portfolio.filter(s => s.id !== round.startupId);
      return {
        ...state,
        cash: state.cash + exitValue,
        portfolio,
        seriesRound: null,
        log: [...state.log, { year: state.year, quarter: state.quarter, type: 'exit', text: `Secondary exit from ${round.startupName}: cashed out ${formatMoney(exitValue)}` }],
      };
    }

    case 'DISMISS_EVENT':
      return { ...state, currentEvent: null };
    case 'APPROVE_PIVOT': {
      const portfolio = state.portfolio.map(s => {
        if (s.id === state.currentEvent?.startupId) {
          return { ...s, pivoted: true, growthRate: Math.random() * 0.4, sector: pick(SECTORS), runway: s.runway + 6 };
        }
        return s;
      });
      return { ...state, portfolio, currentEvent: null };
    }
    case 'FORCE_LIQUIDATION': {
      const startup = state.portfolio.find(s => s.id === state.currentEvent?.startupId);
      const clawback = startup ? startup.initialCheck * 0.2 : 0;
      const portfolio = state.portfolio.filter(s => s.id !== state.currentEvent?.startupId);
      return {
        ...state,
        cash: state.cash + clawback,
        portfolio,
        currentEvent: null,
        log: [...state.log, { year: state.year, quarter: state.quarter, type: 'liquidation', text: `Forced liquidation of ${startup?.name}: recovered ${formatMoney(clawback)}` }],
      };
    }
    case 'ADVANCE_QUARTER': {
      let newState = { ...state };
      // Advance time
      let newQ = state.quarter + 1;
      let newY = state.year;
      if (newQ > 4) { newQ = 1; newY++; }
      newState.quarter = newQ;
      newState.year = newY;
      
      // Reset value-add flags on new year
      if (newQ === 1) {
        newState.portfolio = newState.portfolio.map(s => ({ ...s, valueAddUsedThisYear: false }));
      }

      // Market cycle shift (every 2-4 quarters)
      if (Math.random() < 0.35) {
        newState.marketCycle = pick(MARKET_CYCLES);
      }
      newState.interestRate = clamp(newState.interestRate + (Math.random() - 0.5) * 1.5, 1, 15);
      newState.hypeIndex = clamp(newState.hypeIndex + rand(-15, 15), 0, 100);


      // Update portfolio startups
      let events = [];
      let updatedPortfolio = newState.portfolio.map(s => {
        if (!s.alive || s.exited) return s;
        let updated = { ...s };
        
        // Apply market cycle
        let sectorMult = 1.0;
        if (newState.marketCycle.sector === s.sector || newState.marketCycle.sector === 'all') {
          sectorMult = newState.marketCycle.multiplier;
        }
        
        // Grow or shrink valuation
        const growthThisQ = (updated.growthRate * sectorMult * 0.25) + (Math.random() - 0.4) * 0.1;
        updated.currentValuation = Math.max(100000, updated.currentValuation * (1 + growthThisQ));
        updated.runway = updated.runway - 3;
        
        // Check for death (ran out of runway)
        if (updated.runway <= 0 && Math.random() > updated.baseQuality) {
          updated.alive = false;
          events.push({ type: 'death', startupId: s.id, text: `💀 ${s.name} ran out of cash and shut down. Total loss on your ${formatMoney(s.initialCheck)} investment.` });
        }
        
        // Random events
        const eventRoll = Math.random();
        if (eventRoll < 0.04 && updated.alive) {
          // Ghosting event
          updated.alive = false;
          events.push({ type: 'ghosting', startupId: s.id, text: `👻 The founder of ${s.name} went radio silent, deleted their LinkedIn, and ran away with the seed money. Total loss.` });
          newState.reputation = clamp(newState.reputation - 5, 0, 100);
        } else if (eventRoll < 0.08 && updated.alive && !updated.pivoted) {
          // Pivot event
          events.push({ type: 'pivot', startupId: s.id, text: `🔄 ${s.name} realizes their product failed. The founder wants to pivot to "${pick(PITCH_TEMPLATES[pick(SECTORS)])}". What do you do?`, needsDecision: true });
        } else if (eventRoll < 0.12 && updated.alive && updated.currentValuation > updated.preMoneyValuation * 5) {
          // Acquisition exit
          const acquirer = pick(['Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Salesforce', 'Oracle', 'Nvidia']);
          const exitVal = updated.currentValuation * (1 + Math.random() * 0.5);
          const payout = (updated.equityPercent / 100) * exitVal;
          updated.alive = false;
          updated.exited = true;
          events.push({ type: 'exit', startupId: s.id, text: `🏆 ${acquirer} acquires ${s.name} for ${formatMoney(exitVal)}! Your ${updated.equityPercent.toFixed(1)}% stake returns ${formatMoney(payout)}!`, payout });
          newState.cash = (newState.cash || state.cash) + payout;
          newState.reputation = clamp((newState.reputation || state.reputation) + 10, 0, 100);
        } else if (eventRoll < 0.16 && updated.alive && updated.roundsRaised < 3 && updated.currentValuation > updated.preMoneyValuation * 2) {
          // Series round trigger
          updated.seriesTriggered = true;
        }
        
        return updated;
      });


      newState.portfolio = updatedPortfolio;
      
      // Handle series round
      const seriesCandidate = updatedPortfolio.find(s => s.seriesTriggered && s.alive && !s.exited);
      if (seriesCandidate) {
        const roundSize = seriesCandidate.currentValuation * (0.2 + Math.random() * 0.3);
        const newVal = seriesCandidate.currentValuation + roundSize;
        const dilutionFactor = seriesCandidate.currentValuation / newVal;
        const proRataCost = (seriesCandidate.equityPercent / 100) * roundSize;
        newState.seriesRound = {
          startupId: seriesCandidate.id,
          startupName: seriesCandidate.name,
          currentEquity: seriesCandidate.equityPercent,
          roundSize,
          newValuation: newVal,
          dilutionFactor,
          proRataCost,
          vcName: pick(['Sequoia Capital', 'Andreessen Horowitz', 'Accel Partners', 'Benchmark', 'Lightspeed', 'Greylock']),
          series: ['A', 'B', 'C'][seriesCandidate.roundsRaised] || 'D',
        };
        newState.portfolio = newState.portfolio.map(s => s.id === seriesCandidate.id ? { ...s, seriesTriggered: false } : s);
      }
      
      // Generate new deal flow
      newState.dealFlow = generateDealFlow();
      
      // Handle events queue
      if (events.length > 0) {
        newState.currentEvent = events[0];
        newState.events = events.slice(1);
      }
      
      // Reputation passive growth
      newState.reputation = clamp(newState.reputation + (newState.portfolio.filter(s => s.alive).length > 0 ? 1 : 0), 0, 100);
      
      // Network upgrade
      if (newState.reputation >= 70) newState.network = 'Global VC Elite';
      else if (newState.reputation >= 40) newState.network = 'National Angel Network';
      else if (newState.reputation >= 20) newState.network = 'Regional Investor Circle';
      
      // Log
      newState.log = [...(newState.log || state.log), { year: newY, quarter: newQ, type: 'quarter', text: `Advanced to Q${newQ} ${newY}` }];
      
      return newState;
    }
    case 'LOAD_GAME':
      return { ...action.payload, phase: 'playing' };
    default:
      return state;
  }
}


// ═══════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MetricCard({ label, value, color, icon }) {
  const colorClasses = {
    gold: 'border-amber-400/50 bg-amber-400/5 text-amber-300',
    green: 'border-emerald-400/50 bg-emerald-400/5 text-emerald-300',
    blue: 'border-blue-400/50 bg-blue-400/5 text-blue-300',
    purple: 'border-purple-400/50 bg-purple-400/5 text-purple-300',
    red: 'border-red-400/50 bg-red-400/5 text-red-300',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 ${colorClasses[color]} shadow-lg`}>
      <div className="text-xs uppercase tracking-wider opacity-70 font-medium">{icon} {label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function TopBar({ state }) {
  const totalPortfolioValue = state.portfolio
    .filter(s => s.alive && !s.exited)
    .reduce((acc, s) => acc + (s.equityPercent / 100) * s.currentValuation, 0);
  const netWorth = state.cash + totalPortfolioValue;
  const roi = state.totalInvested > 0 ? (((netWorth - 500000) / 500000) * 100) : 0;

  return (
    <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-amber-300 tracking-tight">👼 Angel Investor: The Godfather of Silicon Valley</h1>
        <div className="text-sm text-slate-400 font-mono">Q{state.quarter} {state.year}</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Net Worth" value={formatMoney(netWorth)} color="gold" icon="💰" />
        <MetricCard label="Liquid Cash" value={formatMoney(state.cash)} color="green" icon="💵" />
        <MetricCard label="Total Invested" value={formatMoney(state.totalInvested)} color="blue" icon="📈" />
        <MetricCard label="Portfolio ROI" value={`${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`} color={roi >= 0 ? 'purple' : 'red'} icon="📊" />
        <MetricCard label="Reputation" value={`${state.reputation}/100`} color="gold" icon="⭐" />
      </div>
    </div>
  );
}


function TabNav({ activeTab, dispatch }) {
  const tabs = [
    { id: 'deals', label: 'Deal Flow', icon: '📋' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'syndicate', label: 'Syndicate', icon: '🤝' },
    { id: 'market', label: 'Market Intel', icon: '🌐' },
  ];
  return (
    <div className="flex border-b border-slate-700/50 bg-slate-800/50 px-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === tab.id
              ? 'border-amber-400 text-amber-300 bg-amber-400/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}

function SectorBadge({ sector }) {
  const colors = {
    AI: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    BioTech: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    FinTech: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Web3: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    SaaS: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    CleanTech: 'bg-green-500/20 text-green-300 border-green-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[sector] || 'bg-slate-500/20 text-slate-300'}`}>
      {sector}
    </span>
  );
}

function FounderTag({ tag }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600/40 text-slate-300 border border-slate-500/30">
      {tag}
    </span>
  );
}


// ═══════════════════════════════════════════════════════════════
// TAB 1: DEAL FLOW
// ═══════════════════════════════════════════════════════════════

function DealFlowTab({ state, dispatch }) {
  if (state.dealFlow.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-lg font-medium">No deals in the pipeline this quarter.</p>
        <p className="text-sm mt-2">Hit "Advance Quarter" to see new deal flow.</p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-100">📋 Pitch Deck Scanner</h2>
        <span className="text-sm text-slate-400">{state.dealFlow.length} startups in queue</span>
      </div>
      <div className="grid gap-4">
        {state.dealFlow.map(startup => (
          <div key={startup.id} className="border border-slate-600/50 rounded-xl p-5 bg-slate-800/50 hover:bg-slate-800/80 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{startup.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <SectorBadge sector={startup.sector} />
                  <FounderTag tag={startup.founderTag} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Asking</div>
                <div className="text-lg font-bold text-amber-300">{formatMoney(startup.requestedCapital)}</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">💡 {startup.pitch}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Pre-money: {formatMoney(startup.preMoneyValuation)}</div>
              <div className="flex gap-2">
                <button onClick={() => dispatch({ type: 'REJECT_DEAL', payload: startup.id })} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all">
                  ❌ Reject
                </button>
                <button onClick={() => dispatch({ type: 'START_DIALOGUE', payload: startup.id })} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-all">
                  ☕ Coffee Chat
                </button>
                <button onClick={() => dispatch({ type: 'INVEST', payload: startup.id })} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all" disabled={state.cash < startup.requestedCapital}>
                  ✅ Invest
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// TAB 2: PORTFOLIO TRACKER
// ═══════════════════════════════════════════════════════════════

function PortfolioTab({ state, dispatch }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const activePortfolio = state.portfolio.filter(s => s.alive && !s.exited);
  const deadPortfolio = state.portfolio.filter(s => !s.alive || s.exited);
  
  const getRunwayStatus = (runway) => {
    if (runway > 12) return { label: 'Healthy', color: 'text-emerald-400' };
    if (runway > 6) return { label: 'Burning', color: 'text-amber-400' };
    return { label: 'Critical', color: 'text-red-400' };
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">💼 Cap Table & Portfolio</h2>
      {activePortfolio.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">📂</div>
          <p>No active investments yet. Head to Deal Flow to make your first check!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-700">
                <th className="pb-3 pr-4">Startup</th>
                <th className="pb-3 pr-4">Sector</th>
                <th className="pb-3 pr-4">Equity %</th>
                <th className="pb-3 pr-4">Check</th>
                <th className="pb-3 pr-4">Valuation</th>
                <th className="pb-3 pr-4">Multiple</th>
                <th className="pb-3 pr-4">Runway</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {activePortfolio.map(s => {
                const multiple = ((s.equityPercent / 100) * s.currentValuation) / s.initialCheck;
                const runway = getRunwayStatus(s.runway);
                return (
                  <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                    <td className="py-3 pr-4 font-semibold text-slate-200">{s.name}</td>
                    <td className="py-3 pr-4"><SectorBadge sector={s.sector} /></td>
                    <td className="py-3 pr-4 font-mono text-amber-300">{s.equityPercent.toFixed(1)}%</td>
                    <td className="py-3 pr-4 text-slate-300">{formatMoney(s.initialCheck)}</td>
                    <td className="py-3 pr-4 text-slate-200 font-medium">{formatMoney(s.currentValuation)}</td>
                    <td className={`py-3 pr-4 font-bold ${multiple >= 2 ? 'text-emerald-400' : multiple >= 1 ? 'text-amber-300' : 'text-red-400'}`}>{multiple.toFixed(1)}x</td>
                    <td className={`py-3 pr-4 font-medium ${runway.color}`}>{runway.label}</td>
                    <td className="py-3">
                      {!s.valueAddUsedThisYear ? (
                        <div className="relative">
                          <button onClick={() => setSelectedAction(selectedAction === s.id ? null : s.id)} className="px-2 py-1 text-xs rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20">
                            ⚡ Value-Add
                          </button>
                          {selectedAction === s.id && (
                            <div className="absolute right-0 top-8 z-10 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-2 min-w-48">
                              {VALUE_ADD_ACTIONS.map(a => (
                                <button key={a.id} onClick={() => { dispatch({ type: 'VALUE_ADD', payload: { startupId: s.id, actionType: a.id } }); setSelectedAction(null); }} className="block w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded">
                                  {a.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">✓ Used</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {deadPortfolio.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Exited / Dead</h3>
          <div className="space-y-2">
            {deadPortfolio.map(s => (
              <div key={s.id} className={`text-xs px-3 py-2 rounded border ${s.exited ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
                {s.exited ? '🏆' : '💀'} {s.name} — {s.exited ? 'Acquired' : 'Defunct'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// TAB 3: SYNDICATE & SERIES ROUNDS
// ═══════════════════════════════════════════════════════════════

function SyndicateTab({ state, dispatch }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">🤝 Syndicate Network & Later Rounds</h2>
      
      {state.seriesRound ? (
        <div className="border border-amber-500/30 rounded-xl p-6 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚨</span>
            <h3 className="text-lg font-bold text-amber-300">Series {state.seriesRound.series} Round — {state.seriesRound.startupName}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-400">Lead VC</div>
              <div className="text-sm font-bold text-slate-200">{state.seriesRound.vcName}</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-400">Round Size</div>
              <div className="text-sm font-bold text-blue-300">{formatMoney(state.seriesRound.roundSize)}</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-400">New Valuation</div>
              <div className="text-sm font-bold text-emerald-300">{formatMoney(state.seriesRound.newValuation)}</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-400">Your Current Equity</div>
              <div className="text-sm font-bold text-amber-300">{state.seriesRound.currentEquity.toFixed(1)}%</div>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            {state.seriesRound.vcName} is leading a Series {state.seriesRound.series} round. Your equity will dilute from <span className="text-amber-300 font-bold">{state.seriesRound.currentEquity.toFixed(1)}%</span> to <span className="text-red-400 font-bold">{(state.seriesRound.currentEquity * state.seriesRound.dilutionFactor).toFixed(1)}%</span> unless you participate pro-rata.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => dispatch({ type: 'PRO_RATA' })} disabled={state.cash < state.seriesRound.proRataCost} className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
              💰 Pro-Rata ({formatMoney(state.seriesRound.proRataCost)})
            </button>
            <button onClick={() => dispatch({ type: 'ACCEPT_DILUTION' })} className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all">
              📉 Accept Dilution ($0)
            </button>
            <button onClick={() => dispatch({ type: 'SECONDARY_EXIT' })} className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all">
              🚪 Secondary Exit ({formatMoney((state.seriesRound.currentEquity / 100) * state.seriesRound.newValuation)})
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">⏳</div>
          <p>No active funding rounds. When portfolio startups scale, VCs will come knocking.</p>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Network Status</h3>
        <div className="border border-slate-600/50 rounded-lg p-4 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-200">🌐 {state.network}</div>
              <div className="text-xs text-slate-400 mt-1">Reputation: {state.reputation}/100</div>
            </div>
            <div className="text-right text-xs text-slate-400">
              {state.reputation < 20 && 'Build rep to unlock better deal flow'}
              {state.reputation >= 20 && state.reputation < 40 && 'Regional connections growing'}
              {state.reputation >= 40 && state.reputation < 70 && 'Top VCs know your name'}
              {state.reputation >= 70 && 'Legendary angel investor status'}
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all" style={{ width: `${state.reputation}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// TAB 4: MARKET INTELLIGENCE
// ═══════════════════════════════════════════════════════════════

function MarketTab({ state }) {
  const getHypeColor = (index) => {
    if (index > 75) return 'text-red-400';
    if (index > 50) return 'text-amber-400';
    if (index > 25) return 'text-blue-300';
    return 'text-blue-500';
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">🌐 Market Intelligence & Trends</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="border border-slate-600/50 rounded-xl p-5 bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Macro Environment</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Interest Rate</span>
                <span className="font-mono font-bold text-blue-300">{state.interestRate.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(state.interestRate / 15) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Tech Bubble Hype Meter</span>
                <span className={`font-mono font-bold ${getHypeColor(state.hypeIndex)}`}>{state.hypeIndex}/100</span>
              </div>
              <div className="mt-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${state.hypeIndex > 75 ? 'bg-red-400' : state.hypeIndex > 50 ? 'bg-amber-400' : 'bg-blue-400'}`} style={{ width: `${state.hypeIndex}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-slate-600/50 rounded-xl p-5 bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Current Market Cycle</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{state.marketCycle.multiplier > 1 ? '📈' : state.marketCycle.multiplier < 1 ? '📉' : '➡️'}</span>
            <div>
              <div className="font-bold text-slate-100">{state.marketCycle.name}</div>
              <div className={`text-sm font-mono ${state.marketCycle.multiplier > 1 ? 'text-emerald-400' : state.marketCycle.multiplier < 1 ? 'text-red-400' : 'text-slate-400'}`}>
                {state.marketCycle.multiplier > 1 ? '+' : ''}{((state.marketCycle.multiplier - 1) * 100).toFixed(0)}% valuation impact
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400">{state.marketCycle.desc}</p>
          {state.marketCycle.sector !== 'all' && (
            <div className="mt-2">
              <span className="text-xs text-slate-500">Affected sector: </span>
              <SectorBadge sector={state.marketCycle.sector} />
            </div>
          )}
        </div>
      </div>
      
      <div className="border border-slate-600/50 rounded-xl p-5 bg-slate-800/30">
        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Transaction Log</h3>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {state.log.slice().reverse().slice(0, 20).map((entry, i) => (
            <div key={i} className="text-xs py-1.5 px-3 rounded bg-slate-700/30 text-slate-300 flex justify-between">
              <span>{entry.text}</span>
              <span className="text-slate-500 ml-4 shrink-0">Q{entry.quarter} {entry.year}</span>
            </div>
          ))}
          {state.log.length === 0 && <p className="text-xs text-slate-500">No transactions yet.</p>}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// DIALOGUE / INTERROGATION ENGINE
// ═══════════════════════════════════════════════════════════════

function DialogueModal({ state, dispatch }) {
  if (!state.dialogue) return null;
  const { startup, messages, questionsAsked } = state.dialogue;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-100">☕ Coffee Chat — {startup.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <SectorBadge sector={startup.sector} />
              <FounderTag tag={startup.founderTag} />
            </div>
          </div>
          <button onClick={() => dispatch({ type: 'CLOSE_DIALOGUE' })} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'player' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm ${
                msg.from === 'player'
                  ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                  : 'bg-slate-700/50 text-slate-200 border border-slate-600/50'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-700">
          {questionsAsked < 3 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">Ask a probing question ({3 - questionsAsked} remaining):</p>
              <div className="flex flex-wrap gap-2">
                {QUESTIONS.map(q => (
                  <button key={q.id} onClick={() => dispatch({ type: 'ASK_QUESTION', payload: { questionId: q.id } })} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 transition-all">
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">No questions remaining. Make your decision.</p>
              <div className="flex gap-2">
                <button onClick={() => dispatch({ type: 'CLOSE_DIALOGUE' })} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                  ❌ Pass
                </button>
                <button onClick={() => { dispatch({ type: 'INVEST', payload: startup.id }); dispatch({ type: 'CLOSE_DIALOGUE' }); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20" disabled={state.cash < startup.requestedCapital}>
                  ✅ Invest {formatMoney(startup.requestedCapital)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// EVENT MODAL
// ═══════════════════════════════════════════════════════════════

function EventModal({ state, dispatch }) {
  if (!state.currentEvent) return null;
  const event = state.currentEvent;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`bg-slate-900 border rounded-2xl max-w-lg w-full p-6 shadow-2xl ${
        event.type === 'exit' ? 'border-amber-400/50' : event.type === 'ghosting' || event.type === 'death' ? 'border-red-500/50' : 'border-slate-600'
      }`}>
        <div className="text-center mb-4">
          {event.type === 'exit' && <div className="text-5xl mb-3 animate-bounce">🏆</div>}
          {event.type === 'ghosting' && <div className="text-5xl mb-3">👻</div>}
          {event.type === 'death' && <div className="text-5xl mb-3">💀</div>}
          {event.type === 'pivot' && <div className="text-5xl mb-3">🔄</div>}
        </div>
        
        <h3 className={`text-lg font-bold text-center mb-3 ${
          event.type === 'exit' ? 'text-amber-300' : event.type === 'pivot' ? 'text-blue-300' : 'text-red-400'
        }`}>
          {event.type === 'exit' ? 'ACQUISITION!' : event.type === 'pivot' ? 'PIVOT REQUEST' : 'PORTFOLIO ALERT'}
        </h3>
        
        <p className="text-sm text-slate-300 text-center leading-relaxed mb-6">{event.text}</p>
        
        <div className="flex justify-center gap-3">
          {event.needsDecision ? (
            <>
              <button onClick={() => dispatch({ type: 'APPROVE_PIVOT' })} className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20">
                ✅ Approve Pivot
              </button>
              <button onClick={() => dispatch({ type: 'FORCE_LIQUIDATION' })} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                💰 Force Liquidation (20%)
              </button>
            </>
          ) : (
            <button onClick={() => dispatch({ type: 'DISMISS_EVENT' })} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600">
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════

function SplashScreen({ dispatch }) {
  const [hasSave, setHasSave] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('angel-investor-save');
    if (saved) setHasSave(true);
  }, []);
  
  const loadGame = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('angel-investor-save'));
      if (saved) dispatch({ type: 'LOAD_GAME', payload: saved });
    } catch (e) {
      console.error('Failed to load save', e);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <div className="text-7xl mb-6">👼</div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 mb-2">
          Angel Investor
        </h1>
        <p className="text-lg text-slate-400 mb-1 font-medium">The Godfather of Silicon Valley</p>
        <p className="text-sm text-slate-500 mb-10">An endless venture capital simulation</p>
        
        <div className="space-y-3">
          <button onClick={() => dispatch({ type: 'SET_PHASE', payload: 'profile' })} className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20">
            🚀 Launch New Fund
          </button>
          {hasSave && (
            <button onClick={loadGame} className="w-full px-8 py-4 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-600 hover:bg-slate-700 transition-all">
              📂 Resume Investment Fund
            </button>
          )}
        </div>
        
        <p className="text-xs text-slate-600 mt-8">Progress auto-saves each fiscal year</p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PROFILE SELECTION SCREEN
// ═══════════════════════════════════════════════════════════════

function ProfileScreen({ dispatch }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-100 mb-2">Choose Your Background</h2>
          <p className="text-slate-400">Your past career grants permanent buffs to your investment strategy.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {BACKGROUNDS.map(bg => (
            <button
              key={bg.id}
              onClick={() => dispatch({ type: 'SELECT_BACKGROUND', payload: bg })}
              className="text-left border border-slate-600/50 rounded-xl p-6 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-400/50 transition-all group"
            >
              <div className="text-4xl mb-3">{bg.emoji}</div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-1">{bg.title}</h3>
              <p className="text-xs text-emerald-400 font-mono mb-3">{bg.buff}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{bg.desc}</p>
            </button>
          ))}
        </div>
        
        <div className="text-center mt-8 border border-slate-700/50 rounded-xl p-5 bg-slate-800/30">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Starting Conditions</h4>
          <div className="flex justify-center gap-8 text-sm">
            <div><span className="text-slate-500">Capital:</span> <span className="text-emerald-400 font-bold">$500,000</span></div>
            <div><span className="text-slate-500">Reputation:</span> <span className="text-amber-400 font-bold">10/100</span></div>
            <div><span className="text-slate-500">Network:</span> <span className="text-blue-300 font-bold">Local Tech Hub</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAIN GAME SCREEN
// ═══════════════════════════════════════════════════════════════

function GameScreen({ state, dispatch }) {
  // Auto-save every fiscal year (Q1)
  useEffect(() => {
    if (state.quarter === 1 && state.year > 2024) {
      localStorage.setItem('angel-investor-save', JSON.stringify(state));
    }
  }, [state.year, state.quarter]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar state={state} />
      <TabNav activeTab={state.activeTab} dispatch={dispatch} />
      
      <div className="flex-1 overflow-y-auto">
        {state.activeTab === 'deals' && <DealFlowTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'portfolio' && <PortfolioTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'syndicate' && <SyndicateTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'market' && <MarketTab state={state} />}
      </div>
      
      {/* Advance Quarter Button */}
      <div className="sticky bottom-0 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          <span className="text-slate-400 font-medium">{state.background?.title}</span> • {state.portfolio.filter(s => s.alive && !s.exited).length} active investments
        </div>
        <button
          onClick={() => dispatch({ type: 'ADVANCE_QUARTER' })}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm hover:from-blue-400 hover:to-purple-400 transition-all shadow-lg shadow-blue-500/20"
        >
          ⏩ Advance Quarter
        </button>
      </div>
      
      {/* Modals */}
      <DialogueModal state={state} dispatch={dispatch} />
      <EventModal state={state} dispatch={dispatch} />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {state.phase === 'splash' && <SplashScreen dispatch={dispatch} />}
      {state.phase === 'profile' && <ProfileScreen dispatch={dispatch} />}
      {state.phase === 'playing' && <GameScreen state={state} dispatch={dispatch} />}
    </div>
  );
}
