import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Save, 
  Settings2, 
  Globe, 
  Box, 
  KeyRound, 
  List, 
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  X,
  History,
  Copy,
  Loader2,
  Zap,
  FileJson,
  Code2,
  Check,
  Search,
  ArrowRight,
  LayoutTemplate,
  Terminal,
  Grid2X2
} from 'lucide-react';

// =============================================================================
// LOGGING UTILITIES - HTTP Node Debug Logging
// =============================================================================
const LOG_PREFIX = '[HTTP_NODE]';
// Enable logging via localStorage: localStorage.setItem('HTTP_NODE_DEBUG', 'true')
const LOG_ENABLED = typeof window !== 'undefined' && (
  localStorage.getItem('HTTP_NODE_DEBUG') === 'true' || 
  (window as any).__HTTP_NODE_DEBUG__ === true
);

// Quick enable/disable functions for console use
if (typeof window !== 'undefined') {
  (window as any).enableHttpNodeDebug = () => {
    localStorage.setItem('HTTP_NODE_DEBUG', 'true');
    (window as any).__HTTP_NODE_DEBUG__ = true;
    console.log('%c[HTTP_NODE] Debug logging ENABLED. Refresh to see all logs.', 'color: #10B981; font-weight: bold;');
  };
  (window as any).disableHttpNodeDebug = () => {
    localStorage.removeItem('HTTP_NODE_DEBUG');
    (window as any).__HTTP_NODE_DEBUG__ = false;
    console.log('%c[HTTP_NODE] Debug logging DISABLED.', 'color: #EF4444; font-weight: bold;');
  };
}

const httpLog = {
  // State changes
  state: (component: string, field: string, oldValue: any, newValue: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [STATE] ${component}.${field}`,
      'color: #3B82F6; font-weight: bold;',
      '\n  OLD:', oldValue,
      '\n  NEW:', newValue,
      '\n  TIMESTAMP:', new Date().toISOString()
    );
  },
  
  // Component lifecycle
  lifecycle: (component: string, event: string, data?: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [LIFECYCLE] ${component} - ${event}`,
      'color: #10B981; font-weight: bold;',
      data ? '\n  DATA:' : '',
      data || ''
    );
  },
  
  // User actions
  action: (component: string, action: string, data?: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [ACTION] ${component} - ${action}`,
      'color: #F59E0B; font-weight: bold;',
      data ? '\n  DATA:' : '',
      data || ''
    );
  },
  
  // Full state snapshot
  snapshot: (label: string, state: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [SNAPSHOT] ${label}`,
      'color: #8B5CF6; font-weight: bold;',
      '\n  FULL STATE:', JSON.stringify(state, null, 2)
    );
  },
  
  // Errors
  error: (component: string, message: string, error?: any) => {
    if (!LOG_ENABLED) return;
    console.error(
      `%c${LOG_PREFIX} [ERROR] ${component} - ${message}`,
      'color: #EF4444; font-weight: bold;',
      error || ''
    );
  },
  
  // Data flow between components
  dataFlow: (from: string, to: string, data: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [DATA_FLOW] ${from} -> ${to}`,
      'color: #EC4899; font-weight: bold;',
      '\n  PAYLOAD:', data
    );
  },
  
  // Pre-test run state
  preTest: (state: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [PRE_TEST] State before test execution`,
      'color: #06B6D4; font-weight: bold; font-size: 14px;',
      '\n===============================================',
      '\n  METHOD:', state.method,
      '\n  URL:', state.url,
      '\n  HEADERS:', JSON.stringify(state.headers, null, 2),
      '\n  ENABLED HEADERS:', state.headers?.filter((h: any) => h.enabled),
      '\n  BODY:', state.body,
      '\n  PARAMS:', state.params,
      '\n  AUTH:', state.auth,
      '\n==============================================='
    );
  }
};

// Export for use in child components
export { httpLog };
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { HeadersConfig } from './HeadersConfig';
import type { Header } from './HeadersConfig';
import { toast } from 'sonner';

// --- Sub-components for Journeys ---

const TemplatesView = ({ onSelectTemplate, selectedTemplate }: { onSelectTemplate: (t: any) => void, selectedTemplate: any }) => {
  const templates = [
    { id: 'stripe', name: 'Stripe Charge', icon: '💳', method: 'POST', url: 'https://api.stripe.com/v1/charges', desc: 'Create a new charge' },
    { id: 'slack', name: 'Slack Message', icon: '💬', method: 'POST', url: 'https://slack.com/api/chat.postMessage', desc: 'Send a message' },
    { id: 'openai', name: 'OpenAI Completion', icon: '🤖', method: 'POST', url: 'https://api.openai.com/v1/completions', desc: 'Generate text completion' },
    { id: 'github', name: 'GitHub Issue', icon: '🐙', method: 'POST', url: 'https://api.github.com/repos/{owner}/{repo}/issues', desc: 'Create a new issue' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelectTemplate(selectedTemplate?.id === t.id ? null : t)}
          className={cn(
            "flex items-start gap-3 p-3 rounded-2xl border transition-all text-left group relative overflow-hidden",
            selectedTemplate?.id === t.id 
              ? "bg-primary/5 border-primary shadow-[0_0_0_1px_hsl(var(--primary))] ring-1 ring-primary/20" 
              : "bg-card border-border/40 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
          )}
        >
          {selectedTemplate?.id === t.id && (
            <div className="absolute top-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-bl-xl">
              <Check className="w-3 h-3" />
            </div>
          )}
          <div className={cn(
            "text-xl p-2 rounded-xl shadow-sm transition-colors",
            selectedTemplate?.id === t.id ? "bg-background" : "bg-muted/30 group-hover:bg-background"
          )}>
            {t.icon}
          </div>
          <div>
            <div className={cn(
              "font-medium text-sm transition-colors",
              selectedTemplate?.id === t.id ? "text-primary" : "text-foreground group-hover:text-primary"
            )}>
              {t.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.desc}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-muted/50 font-mono border-transparent rounded-lg">{t.method}</Badge>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

const CurlEditor = ({ curlInput, setCurlInput }: any) => (
  <div className={cn(
    "relative group rounded-2xl border transition-all overflow-hidden bg-card shadow-sm",
    curlInput ? "border-primary ring-1 ring-primary/20 shadow-[0_0_0_1px_hsl(var(--primary))]" : "border-border/40 hover:border-primary/30"
  )}>
    <div className="absolute top-3 left-3 pointer-events-none z-10">
      <span className="font-mono text-muted-foreground select-none opacity-50">$ </span>
    </div>
    <textarea 
      value={curlInput}
      onChange={(e) => setCurlInput(e.target.value)}
      placeholder="curl -X POST https://api.example.com/..."
      className="flex min-h-[140px] w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono pl-7 resize-none"
    />
    {curlInput && (
      <div className="absolute bottom-3 right-3 animate-in fade-in zoom-in-95 duration-200">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1 shadow-sm rounded-lg">
          <CheckCircle2 className="w-3 h-3" />
          Ready to Import
        </Badge>
      </div>
    )}
  </div>
);

const InitializeJourney = ({ 
  name, setName, description, setDescription, 
  curlInput, setCurlInput,
  selectedTemplate, setSelectedTemplate
}: any) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">
      
      {/* Identity Island */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-heading font-medium text-foreground">Core Identity</h3>
          <p className="text-sm text-muted-foreground">Define what this node represents in your workflow.</p>
        </div>
        
        <div className="p-5 rounded-2xl border border-border/40 bg-card shadow-sm space-y-4">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-foreground/80">Node Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Create Stripe Customer"
              className="font-medium bg-background border-border/60 focus:border-primary/30 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-foreground/80">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Briefly explain what this request does..." 
              className="text-muted-foreground bg-background border-border/60 focus:border-primary/30 rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Configuration Method Tabs */}
      <Tabs defaultValue="curl" className="w-full">
        <TabsList className="bg-muted/20 p-1 mb-6 h-auto w-full justify-start rounded-2xl border border-border/20">
          <TabsTrigger value="curl" className="rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            <Terminal className="w-3.5 h-3.5 mr-2" />
            Import cURL
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            <Zap className="w-3.5 h-3.5 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curl" className="mt-0 focus-visible:outline-none">
          <CurlEditor 
            curlInput={curlInput} 
            setCurlInput={(val: string) => {
              setCurlInput(val);
              if (val) setSelectedTemplate(null);
            }} 
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-0 focus-visible:outline-none">
            <TemplatesView 
            selectedTemplate={selectedTemplate}
            onSelectTemplate={(t: any) => {
              setSelectedTemplate(t);
              if (t) setCurlInput('');
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ConfigureJourney = ({ headers, setHeaders, method, setMethod, url, setUrl }: any) => {
  // ===== LOGGING: Track ConfigureJourney props =====
  useEffect(() => {
    httpLog.lifecycle('ConfigureJourney', 'MOUNTED', {
      method,
      url,
      headersCount: headers?.length,
      headers
    });
    return () => {
      httpLog.lifecycle('ConfigureJourney', 'UNMOUNTED');
    };
  }, []);
  
  // ===== LOGGING: Track prop changes =====
  useEffect(() => {
    httpLog.dataFlow('HttpRequestNode', 'ConfigureJourney', {
      method,
      url,
      headersCount: headers?.length,
      enabledHeaders: headers?.filter((h: any) => h.enabled).length
    });
  }, [method, url, headers]);
  
  const HTTP_METHODS = [
    { value: 'GET', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'POST', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'PUT', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { value: 'PATCH', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'DELETE', color: 'text-red-600 bg-red-50 border-red-200' },
  ];

  const activeMethodColor = HTTP_METHODS.find(m => m.value === method)?.color || 'text-foreground';
  
  // ===== LOGGING: Wrap setMethod and setUrl for tracking =====
  const handleMethodChange = (newMethod: string) => {
    httpLog.action('ConfigureJourney', 'METHOD_CHANGE', { oldMethod: method, newMethod });
    setMethod(newMethod);
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    httpLog.action('ConfigureJourney', 'URL_CHANGE', { oldUrl: url, newUrl: e.target.value });
    setUrl(e.target.value);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Method & URL Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm pb-4 pt-2 z-10 border-b border-transparent transition-all">
        <div className="flex items-center gap-3 p-1 bg-muted/30 rounded-xl border border-border/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/40 transition-all shadow-sm">
          <Select value={method} onValueChange={handleMethodChange}>
            <SelectTrigger className={cn("w-[110px] h-10 border-none shadow-none font-bold tracking-wide focus:ring-0 rounded-l-lg", activeMethodColor)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="font-medium cursor-pointer rounded-lg">
                  <span className={cn("px-2 py-0.5 rounded-md text-xs", m.color)}>{m.value}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-6 w-px bg-border/60" />
          <div className="flex-1 relative">
            <Input 
              value={url}
              onChange={handleUrlChange}
              className="border-none shadow-none h-10 px-2 text-base font-mono text-foreground focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
              placeholder="https://api.example.com/v1/resource"
            />
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <Tabs defaultValue="headers" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-transparent border-b border-border/40 rounded-none p-0 gap-6 mb-6">
          <TabsTrigger value="params" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 pb-3 font-medium bg-transparent">Parameters</TabsTrigger>
          <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 pb-3 font-medium bg-transparent">
            Headers <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 rounded-md">{headers.filter((h: any) => h.enabled).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="auth" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 pb-3 font-medium bg-transparent">Auth</TabsTrigger>
          <TabsTrigger value="body" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 pb-3 font-medium bg-transparent">Body</TabsTrigger>
        </TabsList>

        <TabsContent value="headers" className="mt-0">
          <HeadersConfig headers={headers} setHeaders={setHeaders} />
        </TabsContent>
        
        <TabsContent value="params" className="mt-0">
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
             <List className="w-10 h-10 text-muted-foreground/40 mb-3" />
             <p className="text-sm text-muted-foreground">Query parameters configuration</p>
          </div>
        </TabsContent>

        <TabsContent value="auth" className="mt-0">
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
             <KeyRound className="w-10 h-10 text-muted-foreground/40 mb-3" />
             <p className="text-sm text-muted-foreground">Authentication settings</p>
          </div>
        </TabsContent>

        <TabsContent value="body" className="mt-0">
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 rounded-2xl bg-accent/5">
             <Box className="w-10 h-10 text-muted-foreground/40 mb-3" />
             <p className="text-sm text-muted-foreground">Request body editor</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TestJourney = ({ method, url, headers, body, queryParams, auth }: any) => {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  // ===== LOGGING: Log when TestJourney receives props =====
  useEffect(() => {
    httpLog.lifecycle('TestJourney', 'PROPS_RECEIVED', {
      method,
      url,
      headersCount: headers?.length,
      headers,
      body,
      queryParams,
      auth
    });
  }, [method, url, headers, body, queryParams, auth]);

  const runTest = () => {
    // ===== LOGGING: CRITICAL - Pre-test state snapshot =====
    httpLog.preTest({
      method,
      url,
      headers,
      body,
      params: queryParams,
      auth
    });
    
    // Additional detailed logging
    console.log('%c[HTTP_NODE] ========== PRE-TEST DETAILED BREAKDOWN ==========', 'color: #DC2626; font-weight: bold; font-size: 16px;');
    console.log('%c[HTTP_NODE] METHOD:', 'color: #DC2626;', method);
    console.log('%c[HTTP_NODE] URL:', 'color: #DC2626;', url);
    console.log('%c[HTTP_NODE] HEADERS (raw):', 'color: #DC2626;', headers);
    console.log('%c[HTTP_NODE] HEADERS (enabled only):', 'color: #DC2626;', headers?.filter((h: any) => h.enabled));
    console.log('%c[HTTP_NODE] HEADERS (as object):', 'color: #DC2626;', 
      headers?.filter((h: any) => h.enabled).reduce((acc: any, h: any) => ({ ...acc, [h.key]: h.value }), {})
    );
    console.log('%c[HTTP_NODE] BODY:', 'color: #DC2626;', body);
    console.log('%c[HTTP_NODE] QUERY PARAMS:', 'color: #DC2626;', queryParams);
    console.log('%c[HTTP_NODE] AUTH:', 'color: #DC2626;', auth);
    console.log('%c[HTTP_NODE] ====================================================', 'color: #DC2626; font-weight: bold; font-size: 16px;');
    
    httpLog.action('TestJourney', 'RUN_TEST_CLICKED', { timestamp: new Date().toISOString() });
    
    setStatus('running');
    setTimeout(() => {
      httpLog.action('TestJourney', 'TEST_COMPLETED', { status: 'success' });
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-medium text-foreground">Test & Debug</h3>
          <p className="text-sm text-muted-foreground">Verify your request before publishing.</p>
        </div>
        <Button onClick={runTest} disabled={status === 'running'} className="gap-2 shadow-lg shadow-primary/20 rounded-xl">
          {status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          Run Request
        </Button>
      </div>

      {status === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center border rounded-2xl bg-muted/10 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm mb-4">
            <Zap className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="font-medium">Ready to test</p>
          <p className="text-sm opacity-60 max-w-xs text-center mt-1">
            Click Run Request to execute "{method} {url}" with your current configuration.
          </p>
        </div>
      )}

      {status === 'running' && (
        <div className="flex-1 flex flex-col items-center justify-center border rounded-2xl bg-muted/5">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground animate-pulse">Sending request to {new URL(url).hostname}...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 dark:text-green-400">
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">200 OK</div>
            <div className="text-xs font-mono">342ms</div>
            <div className="text-xs font-mono">1.2kb</div>
          </div>
          
          <div className="flex-1 border rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Response Body (JSON)</span>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg"><Copy className="w-3 h-3" /></Button>
              </div>
            </div>
            <ScrollArea className="flex-1 bg-muted/5 font-mono text-xs p-4">
              <pre className="text-foreground/80">
{`{
  "id": "ch_3LiiG52eZvKYlo2C17p",
  "object": "charge",
  "amount": 2000,
  "amount_captured": 2000,
  "amount_refunded": 0,
  "application": null,
  "application_fee": null,
  "application_fee_amount": null,
  "balance_transaction": "txn_3LiiG52eZvKYlo2C17p",
  "billing_details": {
    "address": {
      "city": null,
      "country": null,
      "line1": null,
      "line2": null,
      "postal_code": null,
      "state": null
    },
    "email": null,
    "name": null,
    "phone": null
  },
  "calculated_statement_descriptor": "Stripe",
  "captured": true,
  "created": 1662998379,
  "currency": "usd",
  "customer": null,
  "description": "My First Test Charge (created for API docs)",
  "destination": null,
  "dispute": null,
  "disputed": false,
  "failure_balance_transaction": null,
  "failure_code": null,
  "failure_message": null,
  "fraud_details": {},
  "invoice": null,
  "livemode": false,
  "metadata": {},
  "on_behalf_of": null,
  "order": null,
  "outcome": {
    "network_status": "approved_by_network",
    "reason": null,
    "risk_level": "normal",
    "risk_score": 59,
    "seller_message": "Payment complete.",
    "type": "authorized"
  },
  "paid": true,
  "payment_intent": null,
  "payment_method": "card_1LiiG42eZvKYlo2C017p",
  "payment_method_details": {
    "card": {
      "brand": "visa",
      "checks": {
        "address_line1_check": null,
        "address_postal_code_check": null,
        "cvc_check": "pass"
      },
      "country": "US",
      "exp_month": 8,
      "exp_year": 2023,
      "fingerprint": "Xt5EWLLDS7FJjR1c",
      "funding": "credit",
      "installments": null,
      "last4": "4242",
      "mandate": null,
      "network": "visa",
      "three_d_secure": null,
      "wallet": null
    },
    "type": "card"
  },
  "receipt_email": null,
  "receipt_number": null,
  "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xMDMyRDgyZVp2S1lsbzJDKKy5rpYGMgZl2q9",
  "refunded": false,
  "refunds": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/charges/ch_3LiiG52eZvKYlo2C17p/refunds"
  },
  "review": null,
  "shipping": null,
  "source": {
    "id": "card_1LiiG42eZvKYlo2C017p",
    "object": "card",
    "address_city": null,
    "address_country": null,
    "address_line1": null,
    "address_line1_check": null,
    "address_line2": null,
    "address_state": null,
    "address_zip": null,
    "address_zip_check": null,
    "brand": "visa",
    "country": "US",
    "cvc_check": "pass",
    "dynamic_last4": null,
    "exp_month": 8,
    "exp_year": 2023,
    "fingerprint": "Xt5EWLLDS7FJjR1c",
    "funding": "credit",
    "last4": "4242",
    "metadata": {},
    "name": null,
    "tokenization_method": null
  },
  "source_transfer": null,
  "statement_descriptor": null,
  "statement_descriptor_suffix": null,
  "status": "succeeded",
  "transfer_data": null,
  "transfer_group": null
}`}
              </pre>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Node Component ---

export function HttpRequestNode() {
  const [activeTab, setActiveTab] = useState<'initialize' | 'configure' | 'test'>('initialize');
  const renderCount = useRef(0);
  renderCount.current++;
  
  // State lifted up
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.stripe.com/v1/charges');
  const [headers, setHeaders] = useState<Header[]>([
    { id: '1', key: 'Authorization', value: 'Bearer {{secrets.STRIPE_KEY}}', enabled: true },
    { id: '2', key: 'Content-Type', value: 'application/x-www-form-urlencoded', enabled: true },
  ]);
  
  // Additional state for body, params, auth (to be fully implemented)
  const [body, setBody] = useState<any>({ type: 'none', content: '' });
  const [queryParams, setQueryParams] = useState<Array<{ id: string; key: string; value: string; enabled: boolean }>>([]);
  const [auth, setAuth] = useState<any>({ type: 'none', data: null });

  // Initialization State
  const [curlInput, setCurlInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // ===== LOGGING: Component mount and render tracking =====
  useEffect(() => {
    httpLog.lifecycle('HttpRequestNode', 'MOUNTED', {
      initialMethod: method,
      initialUrl: url,
      initialHeaders: headers,
      initialBody: body,
      initialParams: queryParams,
      initialAuth: auth
    });
    
    return () => {
      httpLog.lifecycle('HttpRequestNode', 'UNMOUNTED');
    };
  }, []);
  
  // ===== LOGGING: Track all state changes =====
  const prevState = useRef({ name, description, method, url, headers, body, queryParams, auth, activeTab, curlInput });
  
  useEffect(() => {
    const prev = prevState.current;
    
    if (prev.name !== name) httpLog.state('HttpRequestNode', 'name', prev.name, name);
    if (prev.description !== description) httpLog.state('HttpRequestNode', 'description', prev.description, description);
    if (prev.method !== method) httpLog.state('HttpRequestNode', 'method', prev.method, method);
    if (prev.url !== url) httpLog.state('HttpRequestNode', 'url', prev.url, url);
    if (prev.activeTab !== activeTab) httpLog.state('HttpRequestNode', 'activeTab', prev.activeTab, activeTab);
    if (prev.curlInput !== curlInput) httpLog.state('HttpRequestNode', 'curlInput', prev.curlInput?.substring(0, 50) + '...', curlInput?.substring(0, 50) + '...');
    
    // Deep compare headers
    if (JSON.stringify(prev.headers) !== JSON.stringify(headers)) {
      httpLog.state('HttpRequestNode', 'headers', prev.headers, headers);
    }
    
    // Deep compare body
    if (JSON.stringify(prev.body) !== JSON.stringify(body)) {
      httpLog.state('HttpRequestNode', 'body', prev.body, body);
    }
    
    // Deep compare queryParams
    if (JSON.stringify(prev.queryParams) !== JSON.stringify(queryParams)) {
      httpLog.state('HttpRequestNode', 'queryParams', prev.queryParams, queryParams);
    }
    
    // Deep compare auth
    if (JSON.stringify(prev.auth) !== JSON.stringify(auth)) {
      httpLog.state('HttpRequestNode', 'auth', prev.auth, auth);
    }
    
    prevState.current = { name, description, method, url, headers, body, queryParams, auth, activeTab, curlInput };
  }, [name, description, method, url, headers, body, queryParams, auth, activeTab, curlInput]);
  
  // ===== LOGGING: Periodic state snapshot (every 10 seconds when in configure/test) =====
  // Only runs when debug logging is enabled
  useEffect(() => {
    if (!LOG_ENABLED) return;
    if (activeTab === 'configure' || activeTab === 'test') {
      const interval = setInterval(() => {
        httpLog.snapshot('PERIODIC_STATE_CHECK', {
          activeTab,
          name,
          description,
          method,
          url,
          headers,
          enabledHeaders: headers.filter(h => h.enabled),
          body,
          queryParams,
          enabledParams: queryParams.filter(p => p.enabled),
          auth,
          renderCount: renderCount.current
        });
      }, 10000); // 10 seconds to reduce noise
      
      return () => clearInterval(interval);
    }
  }, [activeTab, name, description, method, url, headers, body, queryParams, auth]);
  
  // ===== LOGGING: Wrapped setters for granular tracking =====
  const setHeadersWithLog = (updater: React.SetStateAction<Header[]>) => {
    httpLog.action('HttpRequestNode', 'setHeaders called', { type: typeof updater });
    setHeaders(prev => {
      const newValue = typeof updater === 'function' ? updater(prev) : updater;
      httpLog.dataFlow('HttpRequestNode', 'HeadersConfig', { prevCount: prev.length, newCount: newValue.length, headers: newValue });
      return newValue;
    });
  };

  const steps = [
    { id: 'initialize', label: '1. Initialize', icon: Settings2 },
    { id: 'configure', label: '2. Configure', icon: List },
    { id: 'test', label: '3. Test', icon: Play },
  ];

  const handleNextAction = () => {
    if (activeTab === 'initialize') {
      if (curlInput.trim()) {
        parseCurl();
      } else if (selectedTemplate) {
        setMethod(selectedTemplate.method);
        setUrl(selectedTemplate.url);
        setName(selectedTemplate.name);
        toast.success(`Loaded ${selectedTemplate.name} template`);
        setActiveTab('configure');
      } else {
        toast.info("Starting from scratch");
        setActiveTab('configure');
      }
    } else if (activeTab === 'configure') {
      setActiveTab('test');
    }
  };

  const parseCurl = () => {
    if (!curlInput.trim()) return;
    
    let detectedMethod = 'GET';
    let detectedUrl = '';
    const newHeaders: Header[] = [];

    // Extract URL
    const urlMatch = curlInput.match(/'(http.*?)'|"(http.*?)"|(http\S+)/);
    if (urlMatch) {
      detectedUrl = urlMatch[1] || urlMatch[2] || urlMatch[3];
    }

    // Extract Method
    if (curlInput.includes('-X POST') || curlInput.includes('--request POST')) detectedMethod = 'POST';
    else if (curlInput.includes('-X PUT') || curlInput.includes('--request PUT')) detectedMethod = 'PUT';
    else if (curlInput.includes('-X DELETE') || curlInput.includes('--request DELETE')) detectedMethod = 'DELETE';
    else if (curlInput.includes('-d ') || curlInput.includes('--data')) detectedMethod = 'POST';

    // Extract Headers
    const headerRegex = /-H ['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(curlInput)) !== null) {
      const [full, content] = match;
      const [key, ...values] = content.split(':');
      if (key && values.length) {
        newHeaders.push({
          id: crypto.randomUUID(),
          key: key.trim(),
          value: values.join(':').trim(),
          enabled: true
        });
      }
    }

    if (detectedUrl) {
      setMethod(detectedMethod);
      setUrl(detectedUrl);
      if (newHeaders.length > 0) setHeaders(newHeaders);
      
      toast.success('Imported configuration from cURL', {
        description: `Method: ${detectedMethod}, Headers: ${newHeaders.length}`
      });
      setActiveTab('configure');
    } else {
      toast.error('Could not parse cURL command', { description: 'No valid URL found' });
    }
  };

  const getPrimaryActionLabel = () => {
    if (activeTab === 'initialize') {
      if (curlInput.trim().length > 5) return "Import & Configure";
      if (selectedTemplate) return `Use ${selectedTemplate.name}`;
      return "Start from Scratch";
    }
    if (activeTab === 'configure') return "Next: Test";
    return "Done";
  };

  return (
    <div className="flex flex-col h-full bg-background relative font-sans">
      {/* Top Navigation Bar */}
      <header className="flex-none h-16 px-6 border-b border-border/40 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">{name || 'New HTTP Request'}</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span>{method}</span>
            </div>
          </div>
        </div>

        {/* Journey Stepper */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/40">
            {steps.map((step) => {
              const isActive = activeTab === step.id;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all relative",
                    isActive 
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {step.label}
                  {isActive && <motion.div layoutId="active-step" className="absolute inset-0 border border-primary/10 rounded-lg pointer-events-none" />}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-9 px-4 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow rounded-xl">
            Done
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-3xl mx-auto min-h-[calc(100vh-4rem)]">
            <AnimatePresence mode="wait">
              {activeTab === 'initialize' && (
                <InitializeJourney 
                  key="init"
                  name={name} setName={setName}
                  description={description} setDescription={setDescription}
                  curlInput={curlInput} setCurlInput={setCurlInput}
                  selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
                />
              )}
              {activeTab === 'configure' && (
                <ConfigureJourney 
                  key="config"
                  headers={headers} setHeaders={setHeadersWithLog}
                  method={method} setMethod={setMethod}
                  url={url} setUrl={setUrl}
                />
              )}
              {activeTab === 'test' && (
                <TestJourney 
                  key="test"
                  method={method}
                  url={url}
                  headers={headers}
                  body={body}
                  queryParams={queryParams}
                  auth={auth}
                />
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
      
      {/* Footer Navigation Hints */}
      <div className="flex-none h-14 border-t border-border/40 bg-card px-6 flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          {activeTab === 'initialize' && "Define what this request represents."}
          {activeTab === 'configure' && "Map variables and set technical parameters."}
          {activeTab === 'test' && "Verify functionality before deploying."}
        </div>
        
        <div className="flex gap-2">
           {activeTab !== 'initialize' && (
             <Button variant="ghost" size="sm" onClick={() => {
                if (activeTab === 'test') setActiveTab('configure');
                if (activeTab === 'configure') setActiveTab('initialize');
             }} className="h-9 text-xs rounded-xl">
               Back
             </Button>
           )}
           <Button 
            variant={activeTab === 'initialize' && !curlInput && !selectedTemplate ? "secondary" : "default"}
            size="sm" 
            onClick={handleNextAction} 
            className="h-9 text-xs gap-1.5 min-w-[120px] shadow-sm rounded-xl"
          >
             {getPrimaryActionLabel()} <ArrowRight className="w-3.5 h-3.5" />
           </Button>
        </div>
      </div>
    </div>
  );
}