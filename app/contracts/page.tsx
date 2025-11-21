"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Building2, 
  MapPin, 
  DollarSign,
  Star,
  Clock,
  Target,
  Send,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Activity,
  Calendar
} from "lucide-react";

// Data models based on Gmail parsing
interface BrokerLaneScore {
  broker: string;
  lane: string; // "LA, CA → Phoenix, AZ"
  loadsLast8Weeks: number;
  weeksActive: number; // out of 8
  avgRPM: number;
  avgPaymentDays: number;
  onTimeRate: number; // 0-100
  issueCount: number;
  totalRevenue: number;
  coreScore: number; // 0-100 calculated score
  stage: "historic" | "active" | "steady" | "mini-deal" | "contract";
  trend: "up" | "down" | "stable";
}

interface LaneAnalysis {
  lane: string;
  totalLoads: number;
  totalRevenue: number;
  avgRPM: number;
  weeksActive: number;
  brokerCount: number;
  topBroker: string;
  stability: number; // 0-100
  profitability: "high" | "medium" | "low";
}

// Mock data - this would come from Gmail parsing in production
const MOCK_BROKER_LANES: BrokerLaneScore[] = [
  {
    broker: "TQL",
    lane: "Los Angeles, CA → Phoenix, AZ",
    loadsLast8Weeks: 19,
    weeksActive: 8,
    avgRPM: 2.94,
    avgPaymentDays: 28,
    onTimeRate: 100,
    issueCount: 0,
    totalRevenue: 47500,
    coreScore: 95,
    stage: "steady",
    trend: "up"
  },
  {
    broker: "CH Robinson",
    lane: "Dallas, TX → Atlanta, GA",
    loadsLast8Weeks: 15,
    weeksActive: 7,
    avgRPM: 2.91,
    avgPaymentDays: 25,
    onTimeRate: 93,
    issueCount: 1,
    totalRevenue: 48000,
    coreScore: 88,
    stage: "steady",
    trend: "stable"
  },
  {
    broker: "Coyote Logistics",
    lane: "Chicago, IL → Memphis, TN",
    loadsLast8Weeks: 8,
    weeksActive: 5,
    avgRPM: 2.65,
    avgPaymentDays: 42,
    onTimeRate: 87,
    issueCount: 2,
    totalRevenue: 21200,
    coreScore: 62,
    stage: "active",
    trend: "down"
  },
  {
    broker: "Landstar",
    lane: "Miami, FL → New York, NY",
    loadsLast8Weeks: 12,
    weeksActive: 6,
    avgRPM: 3.15,
    avgPaymentDays: 30,
    onTimeRate: 100,
    issueCount: 0,
    totalRevenue: 42000,
    coreScore: 85,
    stage: "active",
    trend: "up"
  },
];

const MOCK_TOP_LANES: LaneAnalysis[] = [
  {
    lane: "Los Angeles, CA → Phoenix, AZ",
    totalLoads: 28,
    totalRevenue: 70000,
    avgRPM: 2.94,
    weeksActive: 12,
    brokerCount: 3,
    topBroker: "TQL",
    stability: 92,
    profitability: "high"
  },
  {
    lane: "Dallas, TX → Atlanta, GA",
    totalLoads: 22,
    totalRevenue: 68200,
    avgRPM: 2.85,
    weeksActive: 10,
    brokerCount: 4,
    topBroker: "CH Robinson",
    stability: 78,
    profitability: "high"
  },
  {
    lane: "Chicago, IL → Memphis, TN",
    totalLoads: 15,
    totalRevenue: 33750,
    avgRPM: 2.50,
    weeksActive: 8,
    brokerCount: 2,
    topBroker: "Coyote Logistics",
    stability: 65,
    profitability: "medium"
  },
];

export default function ContractsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"snapshot" | "finder" | "build" | "scorecards">("snapshot");
  const [selectedBrokerLane, setSelectedBrokerLane] = useState<BrokerLaneScore | null>(null);
  const [draftedBrokerLanes, setDraftedBrokerLanes] = useState<Set<string>>(new Set());
  const [draftEmail, setDraftEmail] = useState("");

  const DEV_MODE = true;

  // Handle broker-lane selection
  const handleSelectBrokerLane = (bl: BrokerLaneScore) => {
    setSelectedBrokerLane(bl);
    setActiveTab("build");
    window.scrollTo(0, 0);
  };

  // Handle draft generation
  const handleGenerateDraft = (bl: BrokerLaneScore, email: string) => {
    setDraftEmail(email);
    setDraftedBrokerLanes(prev => new Set(prev).add(`${bl.broker}-${bl.lane}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Build Consistent Contracts</h1>
            <p className="text-neutral-600 mt-1">Turn your best broker relationships into reliable, recurring freight</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 border border-neutral-200 rounded-lg hover:border-primary transition-colors text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tabs with Progress Indicators */}
        <div className="border-b border-neutral-200">
          <div className="flex gap-1">
            {[
              { id: "snapshot", label: "1. Analyze", icon: BarChart3 },
              { id: "finder", label: "2. Prioritize", icon: Target },
              { id: "build", label: "3. Outreach", icon: Send },
              { id: "scorecards", label: "4. Track", icon: Star }
            ].map((tab, idx) => {
              const isCompleted = 
                (tab.id === "snapshot") ||
                (tab.id === "finder" && selectedBrokerLane) ||
                (tab.id === "build" && draftEmail);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {isCompleted && activeTab !== tab.id && (
                    <CheckCircle className="w-4 h-4 text-success absolute -top-2 -right-2" />
                  )}
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "snapshot" && (
          <RealitySnapshot 
            lanes={MOCK_TOP_LANES} 
            brokerLanes={MOCK_BROKER_LANES}
            onNext={() => setActiveTab("finder")}
          />
        )}
        {activeTab === "finder" && (
          <CoreBrokerFinder 
            brokerLanes={MOCK_BROKER_LANES} 
            onSelect={handleSelectBrokerLane}
            draftedBrokerLanes={draftedBrokerLanes}
          />
        )}
        {activeTab === "build" && (
          <BuildConsistency 
            selectedBrokerLane={selectedBrokerLane}
            allBrokerLanes={MOCK_BROKER_LANES}
            onSelectDifferent={() => setActiveTab("finder")}
            draftEmail={draftEmail}
            onGenerateDraft={handleGenerateDraft}
          />
        )}
        {activeTab === "scorecards" && <Scorecards brokerLanes={MOCK_BROKER_LANES} />}

      </div>
    </div>
  );
}

// TAB 1: Reality Snapshot (Flow A)
function RealitySnapshot({ 
  lanes, 
  brokerLanes,
  onNext 
}: { 
  lanes: LaneAnalysis[], 
  brokerLanes: BrokerLaneScore[],
  onNext: () => void 
}) {
  const totalRevenue = lanes.reduce((sum, l) => sum + l.totalRevenue, 0);
  const totalLoads = lanes.reduce((sum, l) => sum + l.totalLoads, 0);

  return (
    <div className="space-y-6">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-neutral-600">Last 12 Weeks</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${(totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-neutral-500 mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-neutral-600">Avg RPM</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">$2.85</p>
          <p className="text-xs text-success mt-1">+8% vs avg</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-neutral-600">Core Lanes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{lanes.length}</p>
          <p className="text-xs text-neutral-500 mt-1">{lanes.filter(l => l.stability > 75).length} highly stable</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Building2 className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-neutral-600">Active Brokers</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{new Set(brokerLanes.map(b => b.broker)).size}</p>
          <p className="text-xs text-neutral-500 mt-1">{brokerLanes.filter(b => b.coreScore > 80).length} core partners</p>
        </div>
      </div>

      {/* Top Lanes */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Top Performing Lanes</h3>
        <div className="space-y-3">
          {lanes.map((lane, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-gray-900">{lane.lane}</span>
                  {lane.stability > 80 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 rounded text-xs font-semibold text-success">
                      <CheckCircle className="w-3 h-3" />
                      Best Opportunity
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <span>{lane.totalLoads} loads</span>
                  <span>•</span>
                  <span>${lane.avgRPM.toFixed(2)}/mi</span>
                  <span>•</span>
                  <span>{lane.brokerCount} brokers</span>
                  <span>•</span>
                  <span className="font-medium text-primary">{lane.topBroker} (top)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-success">${(lane.totalRevenue / 1000).toFixed(0)}K</p>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                  <div className={`w-2 h-2 rounded-full ${lane.stability > 80 ? 'bg-success' : lane.stability > 60 ? 'bg-warning' : 'bg-error'}`} />
                  <span>{lane.stability}% stable</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Box */}
      <div className="bg-gradient-to-r from-primary/5 to-primary-hover/5 rounded-xl p-6 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">AI Insight: Your Business Pattern</h4>
            <p className="text-sm text-neutral-700 leading-relaxed mb-3">
              <strong>You&apos;re in Phase 1-2:</strong> You have <strong>3 strong core lanes</strong> with consistent volume, but you&apos;re still running <strong>40% spot loads</strong> with random brokers. 
              Your top 2 broker-lane pairs (TQL on LA→Phoenix, CH Robinson on Dallas→Atlanta) are perfect candidates for <strong>mini-deals</strong> that could lock in +$0.10/mi and guarantee 3+ loads/week.
            </p>
            <div className="bg-warning/10 rounded-lg p-3 border border-warning/20">
              <p className="text-sm font-semibold text-gray-900">
                💰 <strong>You&apos;re leaving $4,800/month on the table.</strong> Let&apos;s fix that by building contracts with your best brokers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Indicator CTA */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={() => {
            onNext();
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-3 px-8 py-4 btn-gradient-primary text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all group"
        >
          <Target className="w-5 h-5" />
          <span>Find Your Best Opportunities</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}

// TAB 2: Core Broker Finder (Flow B)
function CoreBrokerFinder({ 
  brokerLanes, 
  onSelect,
  draftedBrokerLanes 
}: { 
  brokerLanes: BrokerLaneScore[], 
  onSelect: (bl: BrokerLaneScore) => void,
  draftedBrokerLanes: Set<string>
}) {
  const [sortBy, setSortBy] = useState<"coreScore" | "loads" | "revenue">("coreScore");
  
  const sorted = [...brokerLanes].sort((a, b) => {
    if (sortBy === "coreScore") return b.coreScore - a.coreScore;
    if (sortBy === "loads") return b.loadsLast8Weeks - a.loadsLast8Weeks;
    return b.totalRevenue - a.totalRevenue;
  });

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Ranked Broker-Lane Pairs</h3>
          <p className="text-sm text-neutral-600 mt-1">Click any card to create an outreach proposal • Sorted by opportunity strength</p>
        </div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium"
        >
          <option value="coreScore">Sort by Core Score</option>
          <option value="loads">Sort by Load Volume</option>
          <option value="revenue">Sort by Revenue</option>
        </select>
      </div>

      {/* Broker-Lane Cards */}
      <div className="grid grid-cols-1 gap-4">
        {sorted.map((bl, idx) => {
          const monthlyUplift = ((bl.loadsLast8Weeks / bl.weeksActive) * 4 * 0.10 * 850).toFixed(0);
          const isDrafted = draftedBrokerLanes.has(`${bl.broker}-${bl.lane}`);
          
          return (
            <div 
              key={idx}
              className="bg-white rounded-xl p-6 shadow-card border-2 border-neutral-200 hover:border-primary transition-all cursor-pointer group"
              onClick={() => onSelect(bl)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-primary">#{idx + 1}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{bl.broker}</h4>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{bl.lane}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                      <div className={`w-2 h-2 rounded-full ${
                        bl.stage === 'contract' ? 'bg-success' :
                        bl.stage === 'mini-deal' ? 'bg-primary' :
                        bl.stage === 'steady' ? 'bg-warning' :
                        'bg-neutral-400'
                      }`} />
                      {bl.stage === 'contract' ? 'Formal Contract' :
                       bl.stage === 'mini-deal' ? 'Mini-Deal Active' :
                       bl.stage === 'steady' ? 'Ready for Deal' :
                       bl.stage === 'active' ? 'Build Trust' :
                       'Historic Only'}
                    </div>
                    {isDrafted && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs font-semibold text-blue-700">
                        <FileText className="w-3 h-3" />
                        Draft Created
                      </div>
                    )}
                  </div>
                </div>

                {/* Core Score & Potential */}
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">{bl.coreScore}</div>
                  <div className="text-xs text-neutral-500 font-medium mb-2">Core Score</div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 rounded text-xs font-semibold text-success">
                    <TrendingUp className="w-3 h-3" />
                    +${monthlyUplift}/mo
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs text-neutral-500 mt-1">
                    {bl.trend === 'up' ? <TrendingUp className="w-3 h-3 text-success" /> :
                     bl.trend === 'down' ? <TrendingDown className="w-3 h-3 text-error" /> :
                     <Activity className="w-3 h-3 text-neutral-400" />}
                    <span>{bl.trend}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 py-4 border-t border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Last 8 Weeks</p>
                  <p className="text-lg font-bold text-gray-900">{bl.loadsLast8Weeks} loads</p>
                  <p className="text-xs text-neutral-500">{bl.weeksActive}/8 weeks active</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Avg RPM</p>
                  <p className="text-lg font-bold text-success">${bl.avgRPM.toFixed(2)}/mi</p>
                  <p className="text-xs text-neutral-500">${(bl.totalRevenue / 1000).toFixed(0)}K total</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Performance</p>
                  <p className="text-lg font-bold text-gray-900">{bl.onTimeRate}%</p>
                  <p className="text-xs text-neutral-500">on-time delivery</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Payment</p>
                  <p className="text-lg font-bold text-gray-900">{bl.avgPaymentDays}d</p>
                  <p className="text-xs text-neutral-500">{bl.issueCount} issues</p>
                </div>
              </div>

              {/* Action Button - Always visible */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(bl);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 btn-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all group"
                >
                  <span>Create Proposal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// TAB 3: Build Consistency (Flows C & D)
function BuildConsistency({ 
  selectedBrokerLane,
  allBrokerLanes,
  onSelectDifferent,
  draftEmail,
  onGenerateDraft
}: { 
  selectedBrokerLane: BrokerLaneScore | null,
  allBrokerLanes: BrokerLaneScore[],
  onSelectDifferent: () => void,
  draftEmail: string,
  onGenerateDraft: (bl: BrokerLaneScore, email: string) => void
}) {
  const router = useRouter();

  // Generate draft email based on selected broker-lane
  const generateDraftEmail = (bl: BrokerLaneScore) => {
    return `Subject: Capacity Commitment - ${bl.lane} (${bl.broker})

Hi [Broker Contact],

I wanted to reach out about our recent work together on the ${bl.lane} lane.

**Our Track Record:**
• ${bl.loadsLast8Weeks} loads over the last 8 weeks (avg ${(bl.loadsLast8Weeks / bl.weeksActive).toFixed(1)}/week)
• ${bl.onTimeRate}% on-time delivery rate
• ${bl.issueCount === 0 ? 'Zero service failures' : `${bl.issueCount} minor issue${bl.issueCount > 1 ? 's' : ''}`}
• Current avg rate: $${bl.avgRPM.toFixed(2)}/mile

**Proposal:**
I'd like to commit to covering **3–4 loads per week** on this lane for the next 30 days. In exchange, could we lock in a rate of **$${(bl.avgRPM + 0.10).toFixed(2)}/mile** for this trial period?

This would give you:
✓ Guaranteed coverage on a key lane
✓ Consistent communication from a proven partner
✓ Priority response when you have urgent freight

Let me know if you'd like to discuss this week. I'm confident we can build something consistent together.

Best regards,
[Your Name]
[Your Company]`;
  };

  return (
    <div className="space-y-6">
      
      {!selectedBrokerLane ? (
        // No selection state
        <div className="bg-white rounded-2xl p-12 shadow-card border border-neutral-200 text-center">
          <div className="max-w-lg mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Broker-Lane Pair</h3>
            <p className="text-neutral-600 mb-6">
              Go to the <strong>Core Broker Finder</strong> tab and click on a broker-lane pair to draft a capacity commitment or mini-deal proposal.
            </p>
            <button
              onClick={onSelectDifferent}
              className="px-6 py-3 btn-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Go to Core Broker Finder →
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Breadcrumb Navigation */}
          <div className="bg-white rounded-xl p-4 shadow-card border border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <button
                  onClick={onSelectDifferent}
                  className="hover:text-primary transition-colors font-medium"
                >
                  Core Broker Finder
                </button>
                <span>›</span>
                <span className="font-semibold text-gray-900">
                  {selectedBrokerLane.broker} - {selectedBrokerLane.lane}
                </span>
              </div>
              <button
                onClick={onSelectDifferent}
                className="text-primary hover:text-primary-hover text-sm font-medium"
              >
                Change Broker-Lane
              </button>
            </div>
          </div>

          {/* Draft email builder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Context & Primary CTA */}
            <div className="space-y-4">
              {/* Context Card - Compact */}
              <div className="bg-white rounded-xl p-4 shadow-card border border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-500 mb-3">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-neutral-500">Loads (8wk)</span>
                    <p className="font-bold text-gray-900 text-lg">{selectedBrokerLane.loadsLast8Weeks}</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500">Avg RPM</span>
                    <p className="font-bold text-success text-lg">${selectedBrokerLane.avgRPM.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500">On-Time</span>
                    <p className="font-bold text-gray-900 text-lg">{selectedBrokerLane.onTimeRate}%</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500">Payment</span>
                    <p className="font-bold text-gray-900 text-lg">{selectedBrokerLane.avgPaymentDays}d</p>
                  </div>
                </div>
              </div>

              {/* Deal Proposal - Prominent */}
              <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-6 border-2 border-success/30">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-success" />
                  Recommended Mini-Deal
                </h4>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Commitment:</span>
                    <span className="font-semibold text-gray-900">3–4 loads/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Proposed Rate:</span>
                    <span className="font-semibold text-success">${(selectedBrokerLane.avgRPM + 0.10).toFixed(2)}/mi (+$0.10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Trial Period:</span>
                    <span className="font-semibold text-gray-900">30 days</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-success/30">
                    <span className="font-semibold text-neutral-700">Est. Monthly Uplift:</span>
                    <span className="font-bold text-success text-lg">+$1,200</span>
                  </div>
                </div>
                
                {/* Urgency message */}
                <div className="bg-white/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-neutral-700">
                    💡 <strong>This proposal could add $1,200/month starting next week.</strong> The sooner you reach out, the sooner you lock in consistent freight.
                  </p>
                </div>

                {/* PRIMARY CTA */}
                {!draftEmail ? (
                  <button
                    onClick={() => onGenerateDraft(selectedBrokerLane, generateDraftEmail(selectedBrokerLane))}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 btn-gradient-primary text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all group"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Create Outreach Email</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-success text-white rounded-xl font-bold text-lg hover:bg-success/90 transition-all group"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Proposal Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Email Draft */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Draft Email</h3>
              {draftEmail ? (
                <>
                  <textarea
                    value={draftEmail}
                    onChange={(e) => onGenerateDraft(selectedBrokerLane, e.target.value)}
                    className="w-full h-[500px] p-4 border border-neutral-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-success text-white rounded-lg font-semibold hover:bg-success/90 transition-colors">
                      <Send className="w-4 h-4" />
                      Send via Gmail
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(draftEmail)}
                      className="px-6 py-3 border border-neutral-200 rounded-lg font-semibold hover:border-primary transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-neutral-400">
                  <div className="text-center">
                    <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Click &quot;Create Outreach Email&quot; to generate a proposal</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}

// TAB 4: Scorecards (Flow E)
function Scorecards({ brokerLanes }: { brokerLanes: BrokerLaneScore[] }) {
  const brokerStats = brokerLanes.reduce((acc, bl) => {
    if (!acc[bl.broker]) {
      acc[bl.broker] = { loads: 0, revenue: 0, avgRPM: 0, avgPayment: 0, issueCount: 0, lanes: 0 };
    }
    acc[bl.broker].loads += bl.loadsLast8Weeks;
    acc[bl.broker].revenue += bl.totalRevenue;
    acc[bl.broker].avgRPM = (acc[bl.broker].avgRPM * acc[bl.broker].lanes + bl.avgRPM) / (acc[bl.broker].lanes + 1);
    acc[bl.broker].avgPayment = (acc[bl.broker].avgPayment * acc[bl.broker].lanes + bl.avgPaymentDays) / (acc[bl.broker].lanes + 1);
    acc[bl.broker].issueCount += bl.issueCount;
    acc[bl.broker].lanes += 1;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Broker Performance Scorecards</h3>
        <div className="space-y-4">
          {Object.entries(brokerStats).map(([broker, stats]: [string, any]) => (
            <div key={broker} className="p-5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{broker}</h4>
                  <p className="text-sm text-neutral-600">{stats.lanes} active lane{stats.lanes > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor((stats.avgRPM / 3.5) * 5) ? 'fill-warning text-warning' : 'text-neutral-300'}`} />
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Total Loads</p>
                  <p className="text-xl font-bold text-gray-900">{stats.loads}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Revenue</p>
                  <p className="text-xl font-bold text-success">${(stats.revenue / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Avg RPM</p>
                  <p className="text-xl font-bold text-gray-900">${stats.avgRPM.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Payment</p>
                  <p className="text-xl font-bold text-gray-900">{Math.round(stats.avgPayment)}d</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Issues</p>
                  <p className={`text-xl font-bold ${stats.issueCount === 0 ? 'text-success' : stats.issueCount < 3 ? 'text-warning' : 'text-error'}`}>
                    {stats.issueCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="bg-gradient-to-r from-primary/5 to-primary-hover/5 rounded-xl p-6 border border-primary/10">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          AI Recommendations
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <p className="text-neutral-700"><strong>TQL:</strong> High performer (95 score). Push for mini-deal on LA→Phoenix lane at $2.95/mi.</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-neutral-700"><strong>Coyote Logistics:</strong> Declining trend + slow payment (42d). Consider shifting 30% volume to faster-paying brokers.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <p className="text-neutral-700"><strong>Landstar:</strong> Premium RPM ($3.15) + perfect reliability. Expand relationship by offering capacity on adjacent lanes.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
