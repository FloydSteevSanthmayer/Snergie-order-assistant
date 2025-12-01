import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Start with no messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userIdentified, setUserIdentified] = useState(false);
  const [userInfo, setUserInfo] = useState<{name?: string, email?: string, customer_id?: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener('open-chatbot', openHandler);
    return () => window.removeEventListener('open-chatbot', openHandler);
  }, []);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    addMessage(inputValue, false);
    setLoading(true);
    let lower = inputValue.toLowerCase();
    try {
      // Greeting logic
      if (["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].some(greet => lower === greet)) {
        addMessage('Hello! To assist you, please provide your name, email, or customer ID.', true);
        setLoading(false);
        setInputValue('');
        setUserIdentified(false);
        return;
      }

      // If not identified, always ask for ID/email/name before any status/cancel/update
      if (!userIdentified) {
        let info: any = {};
        if (inputValue.includes('@')) info.email = inputValue.trim();
        else if (/\d{6,}/.test(inputValue)) info.customer_id = inputValue.trim();
        else info.name = inputValue.trim();
        setUserInfo(info);

        // Confirm ID/email/name with backend
        const res = await fetch('http://127.0.0.1:8001/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText: JSON.stringify(info) })
        });
        const data = await res.json();
        addMessage(data.analysis || 'Please provide your name, email, or customer ID to proceed.', true);
        // If found, set userIdentified true
        if (data.analysis && !data.analysis.toLowerCase().includes('no order found') && !data.analysis.toLowerCase().includes('please provide')) {
          setUserIdentified(true);
        }
      } else if (lower.includes('cancel')) {
        // Cancel order
        const res = await fetch('http://127.0.0.1:8001/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText: JSON.stringify({ ...userInfo, action: 'cancel' }) })
        });
        const data = await res.json();
        addMessage(data.analysis || 'Order cancellation processed.', true);
      } else if (lower.includes('reschedule') || lower.includes('deliver on') || lower.includes('change delivery') || lower.includes('eta')) {
        // Reschedule delivery
        const res = await fetch('http://127.0.0.1:8001/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText: JSON.stringify({ ...userInfo, action: 'reschedule', message: inputValue }) })
        });
        const data = await res.json();
        addMessage(data.analysis || 'Delivery date updated.', true);
      } else if (lower.includes('status') || lower.includes('track') || lower.includes('delivery date') || lower.includes('expected delivery')) {
        // Status query
        const res = await fetch('http://127.0.0.1:8001/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText: JSON.stringify({ ...userInfo, message: inputValue }) })
        });
        const data = await res.json();
        addMessage(data.analysis || 'Here is the information you requested.', true);
      } else {
        // Product or other queries
        const res = await fetch('http://127.0.0.1:8001/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText: JSON.stringify({ ...userInfo, message: inputValue }) })
        });
        const data = await res.json();
        addMessage(data.analysis || 'Here is the information you requested.', true);
      }
    } catch (e) {
      addMessage('Sorry, there was an error connecting to the assistant.', true);
    } finally {
      setLoading(false);
      setInputValue('');
    }
  };

  return (
    <div className={`fixed top-20 right-6 md:right-8 w-80 max-w-[95vw] h-96 z-[60] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      style={{top: '5.5rem', right: 'max(1rem, env(safe-area-inset-right, 1rem))'}}>
      <Card className="h-full flex flex-col shadow-glow">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Synergie Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit text-xs">
            Online
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{maxHeight: '320px'}}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.isBot
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="p-3 border-t bg-background sticky bottom-0 z-10">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={userIdentified ? "Type your message..." : "Enter name, email, or customer ID..."}
                className="flex-1 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                disabled={loading}
              />
              <Button size="sm" onClick={handleSendMessage} disabled={loading}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};