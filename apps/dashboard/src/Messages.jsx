import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversations, useConversationMessages, useSendMessage, useMarkConversationRead } from './hooks/useMessages';
import { useSession } from './lib/authClient';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';

const timeFormat = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const dateLabel = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function Messages() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: conversations = [], isLoading: convsLoading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showConvList, setShowConvList] = useState(true);
  const messagesEndRef = useRef(null);

  const { data: messageData } = useConversationMessages(activeConversationId);
  const messages = messageData?.messages || [];
  const sendMutation = useSendMessage();
  const markReadMutation = useMarkConversationRead();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (activeConversationId) {
      markReadMutation.mutate(activeConversationId);
    }
  }, [activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversationId) return;

    sendMutation.mutate({ conversationId: activeConversationId, content: messageText }, {
      onSuccess: () => setMessageText(''),
    });
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setShowConvList(false); // Hide list on mobile after selection
  };

  const currentUserId = session?.user?.id;

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b1325]">
      <Sidebar />

      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden bg-[#0b1325]">
        <TopAppBar />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Conversation List */}
          <section className={`${showConvList ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-[#3c4a45]/10 bg-[#131b2d] flex-col flex-shrink-0`}>
            <div className="p-6">
              <h2 className="text-xl font-bold tracking-tight text-[#dbe2fb] mb-6">Messages</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bacac3] text-sm">search</span>
                <input className="w-full bg-[#060e1f] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#dbe2fb] placeholder:text-[#bacac3]/50 focus:ring-2 focus:ring-[#a2e7ff]/30 transition-all outline-none" placeholder="Search conversation" type="text" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-6 px-3 space-y-1">
              {convsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#2d3448]" />
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-3 bg-[#2d3448] rounded" />
                      <div className="w-36 h-2 bg-[#2d3448] rounded" />
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 text-[#bacac3] text-sm">
                  <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">forum</span>
                  Belum ada percakapan
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all ${activeConversationId === conv.id ? 'bg-[#222a3d] shadow-lg border border-[#3c4a45]/5' : 'hover:bg-[#171f32]'}`}
                  >
                    <div className="relative flex-shrink-0">
                      {conv.participantImage ? (
                        <img alt={conv.participantName} className="w-12 h-12 rounded-full bg-[#2d3448] object-cover" src={conv.participantImage} />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#2d3448] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#bacac3]">person</span>
                        </div>
                      )}
                      {conv.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#44e5c2] rounded-full border-2 border-[#222a3d]"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-sm truncate ${activeConversationId === conv.id ? 'font-semibold text-[#44e5c2]' : 'font-medium text-[#dbe2fb]'}`}>
                          {conv.participantName || 'User'}
                        </span>
                        <span className="text-[10px] text-[#bacac3] font-mono">
                          {timeFormat(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[#bacac3] truncate">{conv.lastMessage || '...'}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-[#44e5c2] text-[#00382d] text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{conv.unreadCount}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Right Column: Main Chat Room */}
          <section className={`${!showConvList ? 'flex' : 'hidden'} md:flex flex-1 flex-col relative w-full h-full`}>
            {activeConversation ? (
              <>
                <header className="h-16 bg-[#0b1325]/40 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-[#3c4a45]/5 z-10 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    {/* Back button for mobile */}
                    <button onClick={() => setShowConvList(true)} className="md:hidden p-1 text-[#bacac3] hover:text-white transition-colors">
                      <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="relative">
                      {activeConversation.participantImage ? (
                        <img alt={activeConversation.participantName} className="w-10 h-10 rounded-full bg-[#2d3448] object-cover" src={activeConversation.participantImage} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2d3448] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#bacac3]">person</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#dbe2fb] text-sm">{activeConversation.participantName}</h3>
                      {activeConversation.escrowId && (
                        <p className="text-xs text-[#bacac3] font-mono uppercase tracking-tighter">
                          {activeConversation.escrowItemName || 'Transaction'}
                        </p>
                      )}
                    </div>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 [&::-webkit-scrollbar]:hidden">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-[#bacac3] text-sm">
                      <span className="material-symbols-outlined text-4xl mb-2 block opacity-20">chat</span>
                      Mulai percakapan
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === currentUserId;

                      if (msg.type === 'system') {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <div className="bg-[#2d3448]/60 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-[#44e5c2]/20">
                              <span className="material-symbols-outlined text-[#44e5c2] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                              <p className="text-xs font-medium text-[#44e5c2]">{msg.content}</p>
                            </div>
                          </div>
                        );
                      }

                      return isOwn ? (
                        <div key={msg.id} className="flex flex-row-reverse items-start gap-3 max-w-[80%] ml-auto">
                          <div className="space-y-1 flex flex-col items-end">
                            <div className="bg-[#44e5c2] px-4 py-3 rounded-2xl rounded-tr-none shadow-lg text-sm text-[#00382d] font-medium leading-relaxed">
                              {msg.content}
                            </div>
                            <span className="text-[10px] font-mono text-[#bacac3] mr-1">{timeFormat(msg.createdAt)}</span>
                          </div>
                        </div>
                      ) : (
                        <div key={msg.id} className="flex items-start gap-3 max-w-[80%]">
                          <div className="w-8 h-8 rounded-full bg-[#2d3448] flex items-center justify-center shrink-0 mt-1">
                            <span className="material-symbols-outlined text-sm text-[#bacac3]">person</span>
                          </div>
                          <div className="space-y-1">
                            <div className="bg-[#222a3d] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-[#dbe2fb] leading-relaxed">
                              {msg.content}
                            </div>
                            <span className="text-[10px] font-mono text-[#bacac3] ml-1">{timeFormat(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 md:p-6 bg-[#0b1325]/80 backdrop-blur-xl border-t border-[#3c4a45]/5 flex-shrink-0">
                  <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-4 bg-[#060e1f] p-2 rounded-2xl shadow-inner border border-[#3c4a45]/10 focus-within:border-[#a2e7ff]/30 transition-all">
                    <button type="button" className="w-10 h-10 flex items-center justify-center text-[#bacac3] hover:text-[#a2e7ff] transition-colors">
                      <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <input
                      className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm text-[#dbe2fb] placeholder:text-[#bacac3]/40"
                      placeholder={`Tulis pesan...`}
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <button type="submit" disabled={sendMutation.isPending || !messageText.trim()} className="bg-gradient-to-br from-[#00c9a7] to-[#00d2fd] text-[#00382d] w-10 h-10 flex items-center justify-center rounded-xl shadow-lg hover:shadow-[#44e5c2]/20 active:scale-90 transition-all disabled:opacity-50">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      </button>
                    </div>
                  </form>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#bacac3]">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">forum</span>
                  <p className="text-lg font-bold">Pilih percakapan</p>
                  <p className="text-sm mt-2">Pilih percakapan dari daftar di sebelah kiri</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
