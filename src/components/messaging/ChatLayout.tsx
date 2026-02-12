'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, MoreVertical, Phone, Video, Send, Paperclip, Smile, Check, CheckCheck, Menu, User, Settings, LogOut, ArrowLeft, Image as ImageIcon, Mic, UserPlus, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Message, ChatWithRecipient, User as UserType } from '@/types/messaging';
import { validateAndSanitizeNickname, validateAndSanitizeMessage } from '@/lib/validation';
import { normalizeError, getUserFriendlyMessage, logError } from '@/lib/error-handler';
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export default function ChatLayout() {
  const [chats, setChats] = useState<ChatWithRecipient[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatWithRecipient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [nicknameSearch, setNicknameSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchChatsMemo = useCallback(async (userId: string) => {
    try {
      const { data: chats, error } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats (
            id,
            type,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      if (chats) {
        const formattedChats = await Promise.all(chats.map(async (cp: any) => {
          const otherParticipant = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', cp.chat_id)
            .neq('user_id', userId)
            .single();

          const recipientId = otherParticipant.data?.user_id;
          const recipient = recipientId ? await supabase
            .from('profiles')
            .select('id, nickname, avatar_url')
            .eq('id', recipientId)
            .single() : null;

          return {
            ...cp.chats,
            recipient: recipient?.data || null
          } as ChatWithRecipient;
        }));
        setChats(formattedChats);
      }
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      toast.error(getUserFriendlyMessage(appError));
    }
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        fetchChatsMemo(user.id);
      }
    };
    init();
  }, [fetchChatsMemo, supabase]);

  const fetchMessages = useCallback(async (chatId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  }, [supabase]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      
      const channel = supabase
        .channel(`chat:${selectedChat.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}` 
        }, payload => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChat, fetchMessages, supabase]);

  const fetchChats = useCallback(async (userId: string) => {
    try {
      const { data: participants, error } = await supabase
        .from('chat_participants')
        .select('chat_id, chats (*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (participants) {
        const formattedChats = await Promise.all(participants.map(async (p: { chat_id: string; chats: unknown }) => {
          const chat = (Array.isArray(p.chats) ? p.chats[0] : p.chats) as { id: string; type: 'private' | 'group'; name?: string | null };
          
          const { data: otherParticipant } = await supabase
            .from('chat_participants')
            .select('profiles!chat_participants_user_id_fkey (*)')
            .eq('chat_id', p.chat_id)
            .neq('user_id', userId)
            .maybeSingle();

          const profileData = otherParticipant as { profiles: unknown } | null;
          const profile = (profileData?.profiles && !Array.isArray(profileData.profiles) 
            ? profileData.profiles 
            : Array.isArray(profileData?.profiles) 
              ? profileData.profiles[0] 
              : null) as { id: string; nickname: string; avatar_url: string } | null;

          return {
            id: p.chat_id,
            type: chat.type,
            name: chat.name || undefined,
            recipient: profile ? {
              id: profile.id,
              nickname: profile.nickname,
              avatar_url: profile.avatar_url
            } : undefined
          } as ChatWithRecipient;
        }));
        setChats(formattedChats);
      }
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      toast.error(getUserFriendlyMessage(appError));
    }
  }, [supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !selectedChat || !currentUser) return;
    
    // Rate limiting no cliente (verificação adicional no servidor)
    if (typeof window !== 'undefined') {
      const identifier = `user:${currentUser.id}`;
      const rateLimit = checkRateLimit(identifier, RATE_LIMITS.sendMessage);
      
      if (!rateLimit.allowed) {
        toast.error(`Limite de mensagens excedido. Tente novamente em ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} segundos.`);
        return;
      }
    }
    
    // Validar e sanitizar mensagem
    const validation = validateAndSanitizeMessage(inputText);
    if (!validation.success) {
      toast.error(validation.error || 'Mensagem inválida');
      return;
    }
    
    try {
      const { error } = await supabase.from('messages').insert({
        chat_id: selectedChat.id,
        sender_id: currentUser.id,
        content: validation.data!
      });

      if (error) throw error;
      
      logger.info('Message sent', {
        chatId: selectedChat.id,
        userId: currentUser.id,
        messageLength: validation.data!.length,
      });
      
      setInputText('');
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      toast.error(getUserFriendlyMessage(appError));
    }
  }, [inputText, selectedChat, currentUser, supabase]);

  const handleAddContact = useCallback(async () => {
    if (!nicknameSearch.trim() || !currentUser) return;
    
    // Validar nickname
    const validation = validateAndSanitizeNickname(nicknameSearch);
    if (!validation.success) {
      toast.error(validation.error || 'Nickname inválido');
      return;
    }
    
    try {
      const { data: targetUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('nickname', validation.data!)
        .single();

      if (fetchError || !targetUser) {
        toast.error('Usuário não encontrado');
        return;
      }

      if (targetUser.id === currentUser.id) {
        toast.error("Você não pode adicionar a si mesmo");
        return;
      }

      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({ type: 'private' })
        .select()
        .single();

      if (chatError) throw chatError;

      if (newChat) {
        const { error: participantsError } = await supabase.from('chat_participants').insert([
          { chat_id: newChat.id, user_id: currentUser.id },
          { chat_id: newChat.id, user_id: targetUser.id }
        ]);
        
        if (participantsError) throw participantsError;
        
        toast.success('Chat criado!');
        fetchChatsMemo(currentUser.id);
        setIsAddContactOpen(false);
        setNicknameSearch('');
      }
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      toast.error(getUserFriendlyMessage(appError));
    }
  }, [nicknameSearch, currentUser, supabase, fetchChatsMemo]);

  return (
    <div className="flex h-screen bg-[#0e1621] text-white overflow-hidden font-sans">
      <aside className={`${isSidebarOpen ? 'w-full md:w-[350px]' : 'w-0'} border-r border-[#17212b] flex flex-col transition-all duration-300 md:relative absolute inset-0 z-20 bg-[#17212b]`}>
        <div className="p-4 flex items-center gap-4 border-b border-[#0e1621]">
          <Menu className="w-6 h-6 text-[#708499] cursor-pointer hover:text-white" />
          <div className="flex-1 bg-[#242f3d] rounded-xl flex items-center px-3 py-2">
            <Search className="w-4 h-4 text-[#708499] mr-2" />
            <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
          </div>
          <button onClick={() => setIsAddContactOpen(true)} className="p-2 rounded-full hover:bg-[#242f3d] text-[#4c94d5]"><UserPlus className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div key={chat.id} onClick={() => { setSelectedChat(chat); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-[#202b36] ${selectedChat?.id === chat.id ? 'bg-[#2b5278]' : ''}`}>
              <img src={chat.recipient?.avatar_url || 'https://i.pravatar.cc/150'} alt="" className="w-12 h-12 rounded-full" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm">{chat.recipient?.nickname || chat.name || 'Group'}</h3>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#0e1621] min-w-0">
        {selectedChat ? (
          <>
            <header className="p-3 border-b border-[#17212b] flex items-center justify-between bg-[#17212b] z-10">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 text-[#708499]" onClick={() => setIsSidebarOpen(true)}><ArrowLeft className="w-5 h-5" /></button>
                <div>
                  <h2 className="font-bold text-sm leading-tight">{selectedChat.recipient?.nickname || selectedChat.name}</h2>
                  <p className="text-[11px] text-[#4c94d5]">online</p>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd81f75e492751460.jpg')] bg-fixed bg-center">
               <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 relative shadow-md ${msg.sender_id === currentUser?.id ? 'bg-[#2b5278] text-white rounded-br-none' : 'bg-[#182533] text-white rounded-bl-none border border-[#242f3d]'}`}>
                      <p className="text-[14px] mb-1">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-[#708499]">
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <footer className="p-3 bg-[#17212b] border-t border-[#0e1621]">
              <div className="max-w-3xl mx-auto flex items-end gap-2">
                <div className="flex-1 bg-[#17212b] rounded-2xl flex items-end p-2 px-4 gap-3 min-h-[44px]">
                  <textarea rows={1} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Message" className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] resize-none py-1 placeholder-[#708499]" />
                </div>
                <button onClick={handleSendMessage} className="w-11 h-11 bg-[#2b5278] rounded-full flex items-center justify-center text-white"><Send className="w-5 h-5 ml-0.5" /></button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#708499]"><p className="bg-black/20 px-4 py-1 rounded-full text-xs">Select a chat to start messaging</p></div>
        )}
      </main>

      <AnimatePresence>
        {isAddContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-[#17212b] rounded-2xl p-6 shadow-2xl border border-[#242f3d]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">New Contact</h3>
                <button onClick={() => setIsAddContactOpen(false)}><CloseIcon className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-[#242f3d] rounded-xl flex items-center px-4 py-3">
                  <input type="text" value={nicknameSearch} onChange={(e) => setNicknameSearch(e.target.value)} placeholder="Nickname" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                </div>
                <button onClick={handleAddContact} className="w-full bg-[#2b5278] hover:bg-[#346290] py-3 rounded-xl font-bold">Add</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
