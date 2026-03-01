import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Terminal, 
  Settings, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Sparkles,
  RefreshCcw,
  Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import CodeBlock from './components/CodeBlock';
import { 
  S3_STATIC_WEBSITE, 
  CLOUDFRONT_DISTRIBUTION, 
  ROUTE53_RECORDS, 
  ACM_CERTIFICATE 
} from './components/TerraformTemplates';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [domain, setDomain] = useState('example.com');
  const [bucket, setBucket] = useState('my-website-bucket');
  const [region, setRegion] = useState('us-east-1');
  const [includeCloudFront, setIncludeCloudFront] = useState(true);
  const [includeRoute53, setIncludeRoute53] = useState(true);
  const [terraformCode, setTerraformCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'explanation'>('code');

  const generateCode = () => {
    let code = S3_STATIC_WEBSITE(bucket, region);
    if (includeCloudFront) {
      code += ACM_CERTIFICATE(domain);
      code += CLOUDFRONT_DISTRIBUTION(domain, bucket);
    }
    if (includeRoute53) {
      code += ROUTE53_RECORDS(domain);
    }
    setTerraformCode(code);
  };

  useEffect(() => {
    generateCode();
  }, [domain, bucket, region, includeCloudFront, includeRoute53]);

  const handleExplain = async () => {
    setIsGenerating(true);
    setActiveTab('explanation');
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explain this Terraform code for AWS static website hosting in a concise, professional way for a developer. Highlight the security and performance aspects.
        
        Terraform Code:
        ${terraformCode}`,
      });
      setExplanation(response.text || 'Failed to generate explanation.');
    } catch (error) {
      console.error(error);
      setExplanation('Error generating explanation. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Header */}
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Cloud className="text-emerald-400" size={24} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400/70">Infrastructure as Code</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent"
          >
            AWS Terraform <br /> Architect
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 max-w-2xl leading-relaxed"
          >
            Generate production-ready Terraform configurations for hosting high-performance, 
            secure personal websites on AWS. Built for developers who value speed and best practices.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Controls Panel */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 space-y-8"
          >
            <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Settings size={18} className="text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">Configuration</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Domain Name</label>
                  <input 
                    type="text" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">S3 Bucket Name</label>
                  <input 
                    type="text" 
                    value={bucket}
                    onChange={(e) => setBucket(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="my-website-bucket"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">AWS Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-west-1">eu-west-1 (Ireland)</option>
                    <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Cpu size={18} className="text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">Features</h2>
              </div>

              <div className="space-y-4">
                <FeatureToggle 
                  label="CloudFront CDN" 
                  description="Global edge delivery & HTTPS"
                  active={includeCloudFront}
                  onToggle={() => setIncludeCloudFront(!includeCloudFront)}
                  icon={<Globe size={16} />}
                />
                <FeatureToggle 
                  label="Route 53 DNS" 
                  description="Managed DNS records"
                  active={includeRoute53}
                  onToggle={() => setIncludeRoute53(!includeRoute53)}
                  icon={<Terminal size={16} />}
                />
              </div>
            </section>

            <button 
              onClick={handleExplain}
              disabled={isGenerating}
              className="w-full group flex items-center justify-center gap-2 py-4 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {isGenerating ? (
                <RefreshCcw className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Explain with AI</span>
                </>
              )}
            </button>
          </motion.aside>

          {/* Code Display Area */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-8 flex flex-col h-full min-h-[600px]"
          >
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setActiveTab('code')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  activeTab === 'code' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                )}
              >
                Generated HCL
              </button>
              <button 
                onClick={() => setActiveTab('explanation')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  activeTab === 'explanation' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                )}
              >
                AI Insights
              </button>
            </div>

            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === 'code' ? (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <CodeBlock code={terraformCode} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="explanation"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm prose prose-invert max-w-none"
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCcw className="animate-spin text-emerald-400" size={32} />
                        <p className="text-white/40 animate-pulse">Analyzing infrastructure...</p>
                      </div>
                    ) : explanation ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 mb-6">
                          <Info size={18} />
                          <h3 className="text-lg font-semibold m-0">Architectural Overview</h3>
                        </div>
                        <div className="text-white/70 leading-relaxed whitespace-pre-wrap">
                          {explanation}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <Sparkles className="text-white/10" size={48} />
                        <p className="text-white/40">Click "Explain with AI" to get a detailed breakdown of this configuration.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                icon={<ShieldCheck className="text-emerald-400" />}
                label="Security"
                value="IAM & SSL"
              />
              <StatCard 
                icon={<Globe className="text-blue-400" />}
                label="Delivery"
                value="Global CDN"
              />
              <StatCard 
                icon={<ArrowRight className="text-purple-400" />}
                label="Status"
                value="Ready"
              />
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center">
        <p className="text-white/20 text-xs uppercase tracking-[0.2em]">
          Designed for the modern cloud architect &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function FeatureToggle({ label, description, active, onToggle, icon }: { 
  label: string, 
  description: string, 
  active: boolean, 
  onToggle: () => void,
  icon: React.ReactNode
}) {
  return (
    <button 
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
        active 
          ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20" 
          : "bg-white/[0.01] border-white/5 hover:border-white/10"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/40"
      )}>
        {icon}
      </div>
      <div className="flex-grow">
        <h3 className={cn("text-sm font-semibold", active ? "text-white" : "text-white/60")}>{label}</h3>
        <p className="text-xs text-white/30">{description}</p>
      </div>
      <div className={cn(
        "w-4 h-4 rounded-full border-2 transition-all",
        active ? "bg-emerald-500 border-emerald-500" : "border-white/10"
      )} />
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
      <div className="p-2 bg-white/5 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">{label}</p>
        <p className="text-sm font-semibold text-white/80">{value}</p>
      </div>
    </div>
  );
}
