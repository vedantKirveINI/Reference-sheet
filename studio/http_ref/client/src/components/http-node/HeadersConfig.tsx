import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Sparkles, Variable, Database, Key, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

// =============================================================================
// LOGGING UTILITIES - Headers Config Debug Logging
// =============================================================================
const LOG_PREFIX = '[HEADERS_CONFIG]';
// Enable logging via localStorage: localStorage.setItem('HTTP_NODE_DEBUG', 'true')
const LOG_ENABLED = typeof window !== 'undefined' && (
  localStorage.getItem('HTTP_NODE_DEBUG') === 'true' || 
  (window as any).__HTTP_NODE_DEBUG__ === true
);

const headerLog = {
  action: (action: string, data?: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [ACTION] ${action}`,
      'color: #F59E0B; font-weight: bold;',
      data ? '\n  DATA:' : '',
      data || ''
    );
  },
  
  state: (field: string, oldValue: any, newValue: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [STATE] ${field}`,
      'color: #3B82F6; font-weight: bold;',
      '\n  OLD:', oldValue,
      '\n  NEW:', newValue
    );
  },
  
  lifecycle: (event: string, data?: any) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [LIFECYCLE] ${event}`,
      'color: #10B981; font-weight: bold;',
      data ? '\n  DATA:' : '',
      data || ''
    );
  },
  
  snapshot: (label: string, headers: any[]) => {
    if (!LOG_ENABLED) return;
    console.log(
      `%c${LOG_PREFIX} [SNAPSHOT] ${label}`,
      'color: #8B5CF6; font-weight: bold;',
      '\n  COUNT:', headers?.length,
      '\n  ENABLED:', headers?.filter(h => h.enabled).length,
      '\n  HEADERS:', JSON.stringify(headers, null, 2)
    );
  }
};

export interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HeadersConfigProps {
  headers: Header[];
  setHeaders: React.Dispatch<React.SetStateAction<Header[]>>;
}

const COMMON_HEADERS = [
  "Content-Type",
  "Authorization",
  "Accept",
  "User-Agent",
  "X-Api-Key",
  "Cache-Control"
];

const MOCK_VARIABLES = [
  { label: 'userId', value: '{{context.userId}}', icon: Variable, desc: 'Current User ID' },
  { label: 'email', value: '{{context.email}}', icon: Variable, desc: 'User Email' },
  { label: 'STRIPE_KEY', value: '{{secrets.STRIPE_KEY}}', icon: Key, desc: 'Secret Key' },
  { label: 'api_endpoint', value: '{{env.API_URL}}', icon: Database, desc: 'Environment Variable' },
];

export function HeadersConfig({ headers, setHeaders }: HeadersConfigProps) {
  const prevHeadersRef = useRef(headers);
  const renderCount = useRef(0);
  renderCount.current++;
  
  // ===== LOGGING: Component lifecycle =====
  useEffect(() => {
    headerLog.lifecycle('MOUNTED', { 
      initialHeaders: headers,
      count: headers?.length 
    });
    return () => {
      headerLog.lifecycle('UNMOUNTED', { 
        finalHeaders: headers,
        count: headers?.length 
      });
    };
  }, []);
  
  // ===== LOGGING: Track headers prop changes =====
  useEffect(() => {
    if (JSON.stringify(prevHeadersRef.current) !== JSON.stringify(headers)) {
      headerLog.state('headers prop changed', prevHeadersRef.current, headers);
      prevHeadersRef.current = headers;
    }
  }, [headers]);
  
  // ===== LOGGING: Periodic snapshot (every 10 seconds, only when debug enabled) =====
  useEffect(() => {
    if (!LOG_ENABLED) return;
    const interval = setInterval(() => {
      headerLog.snapshot('PERIODIC_CHECK', headers);
    }, 10000); // 10 seconds to reduce noise
    return () => clearInterval(interval);
  }, [headers]);

  const addHeader = (key: string = '', value: string = '') => {
    const newHeader: Header = { 
      id: crypto.randomUUID(), 
      key, 
      value, 
      enabled: true 
    };
    
    headerLog.action('ADD_HEADER', { 
      newHeader,
      previousCount: headers.length,
      newCount: headers.length + 1
    });
    
    setHeaders(prev => {
      const newHeaders = [...prev, newHeader];
      headerLog.state('headers after add', prev, newHeaders);
      return newHeaders;
    });
  };

  const removeHeader = (id: string) => {
    const headerToRemove = headers.find(h => h.id === id);
    headerLog.action('REMOVE_HEADER', { 
      id, 
      headerToRemove,
      previousCount: headers.length
    });
    
    setHeaders(prev => {
      const newHeaders = prev.filter(h => h.id !== id);
      headerLog.state('headers after remove', prev, newHeaders);
      return newHeaders;
    });
  };

  const updateHeader = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const headerToUpdate = headers.find(h => h.id === id);
    headerLog.action('UPDATE_HEADER', { 
      id, 
      field, 
      oldValue: headerToUpdate?.[field],
      newValue: value,
      headerBefore: headerToUpdate
    });
    
    setHeaders(prev => {
      const newHeaders = prev.map(h => 
        h.id === id ? { ...h, [field]: value } : h
      );
      headerLog.state(`header.${field} updated`, prev, newHeaders);
      return newHeaders;
    });
  };

  const toggleHeader = (id: string) => {
    const headerToToggle = headers.find(h => h.id === id);
    headerLog.action('TOGGLE_HEADER', { 
      id, 
      headerKey: headerToToggle?.key,
      previousEnabled: headerToToggle?.enabled,
      newEnabled: !headerToToggle?.enabled
    });
    
    setHeaders(prev => {
      const newHeaders = prev.map(h => 
        h.id === id ? { ...h, enabled: !h.enabled } : h
      );
      headerLog.state('headers after toggle', prev, newHeaders);
      return newHeaders;
    });
  };

  const activeCount = headers.filter(h => h.enabled).length;
  
  // ===== LOGGING: Log render info (only when debug enabled) =====
  if (LOG_ENABLED) {
    console.log(`%c[HEADERS_CONFIG] [RENDER #${renderCount.current}] Active: ${activeCount}/${headers.length}`, 'color: #6B7280;');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium leading-none text-foreground/90">Request Headers</h3>
          <p className="text-xs text-muted-foreground">
            {activeCount} active {activeCount === 1 ? 'header' : 'headers'} configured
          </p>
        </div>
        <Button 
          onClick={() => addHeader()} 
          size="sm" 
          variant="outline" 
          className="h-8 gap-1 text-xs font-medium border-primary/20 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Header
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {headers.map((header) => (
            <motion.div
              key={header.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10, transition: { duration: 0.2 } }}
              className={cn(
                "group relative flex items-start gap-2 p-2 rounded-lg border border-transparent hover:border-border/60 hover:bg-accent/5 transition-colors focus-within:bg-accent/5 focus-within:border-border/60",
                !header.enabled && "opacity-50"
              )}
            >
              <div className="mt-2.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 cursor-grab active:cursor-grabbing transition-colors">
                <GripVertical className="w-4 h-4" />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleHeader(header.id)}
                className={cn(
                  "h-9 w-9 transition-colors",
                  header.enabled 
                    ? "text-primary hover:text-primary/80 hover:bg-primary/10" 
                    : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/20"
                )}
                title={header.enabled ? "Disable header" : "Enable header"}
              >
                {header.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              </Button>

              <div className="flex-1 grid grid-cols-[1fr,1.5fr] gap-2">
                <div className="relative">
                  <Input 
                    placeholder="Key" 
                    value={header.key}
                    onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                    className="h-9 bg-background border-border/60 focus:border-primary/50 font-mono text-xs shadow-sm transition-all"
                    list={`header-keys-${header.id}`}
                    disabled={!header.enabled}
                  />
                  <datalist id={`header-keys-${header.id}`}>
                    {COMMON_HEADERS.map(h => <option key={h} value={h} />)}
                  </datalist>
                </div>

                <div className="relative group/input">
                  <Input 
                    placeholder="Value" 
                    value={header.value}
                    onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                    className="h-9 bg-background border-border/60 focus:border-primary/50 font-mono text-xs shadow-sm transition-all pr-8"
                    disabled={!header.enabled}
                  />
                  
                  {/* Dynamic Variable Inserter */}
                  {header.enabled && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-primary hover:bg-primary/10">
                            <Sparkles className="w-3.5 h-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-64" align="end">
                          <Command>
                            <CommandInput placeholder="Search variables..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No variables found.</CommandEmpty>
                              <CommandGroup heading="Available Variables">
                                {MOCK_VARIABLES.map((v) => (
                                  <CommandItem 
                                    key={v.value} 
                                    value={v.label}
                                    onSelect={() => updateHeader(header.id, 'value', header.value + v.value)}
                                    className="gap-2 cursor-pointer"
                                  >
                                    <div className="p-1 rounded bg-primary/10 text-primary">
                                      <v.icon className="w-3 h-3" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium">{v.label}</span>
                                      <span className="text-[10px] text-muted-foreground font-mono">{v.value}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeHeader(header.id)}
                className="h-9 w-9 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {headers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border/50 rounded-xl bg-accent/5"
          >
            <p className="text-sm text-muted-foreground mb-3">No headers configured</p>
            <Button variant="outline" size="sm" onClick={() => addHeader()} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Header
            </Button>
          </motion.div>
        )}
      </div>

      {/* Quick Add Headers */}
      <div className="pt-2 flex flex-wrap gap-2 pb-1">
        <Badge 
          variant="secondary" 
          onClick={() => addHeader('Authorization', '')}
          className="text-[10px] font-mono text-muted-foreground bg-accent/10 hover:bg-accent/20 cursor-pointer transition-colors border-transparent hover:border-primary/20 hover:text-primary"
        >
          + Authorization
        </Badge>
        <Badge 
          variant="secondary" 
          onClick={() => addHeader('Content-Type', 'application/json')}
          className="text-[10px] font-mono text-muted-foreground bg-accent/10 hover:bg-accent/20 cursor-pointer transition-colors border-transparent hover:border-primary/20 hover:text-primary"
        >
          + Content-Type
        </Badge>
        <Badge 
          variant="secondary" 
          onClick={() => addHeader('Accept', 'application/json')}
          className="text-[10px] font-mono text-muted-foreground bg-accent/10 hover:bg-accent/20 cursor-pointer transition-colors border-transparent hover:border-primary/20 hover:text-primary"
        >
          + Accept
        </Badge>
        <Badge 
          variant="secondary" 
          onClick={() => addHeader('X-Api-Key', '')}
          className="text-[10px] font-mono text-muted-foreground bg-accent/10 hover:bg-accent/20 cursor-pointer transition-colors border-transparent hover:border-primary/20 hover:text-primary"
        >
          + X-Api-Key
        </Badge>
      </div>
    </div>
  );
}
