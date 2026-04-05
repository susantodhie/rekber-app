import React, { useState, useRef, useEffect } from 'react';
import { useConversations, useConversationMessages, useSendMessage } from '../hooks/useMessages';
import { useSession } from '../lib/authClient';

const timeFormat = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const RoleBadge = ({ role, buyerId, sellerId, senderId }) => {
  // Determine display role based on context
  let displayRole = 'User';
  let badgeClass = 'bg-gray-500/20 text-gray-400';
  let icon = 'person';

  if (role === 'admin') {
    displayRole = 'ADMIN';
    badgeClass = 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    icon = 'shield';
  } else if (senderId === buyerId) {
    displayRole = 'BUYER';
    badgeClass = 'bg-[#44e5c2]/20 text-[#44e5c2]';
    icon = 'shopping_cart';
  } else if (senderId === sellerId) {
    displayRole = 'SELLER';
    badgeClass = 'bg-blue-400/20 text-blue-400';
    icon = 'storefront';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>{icon}</span>
      {displayRole}
    </span>
  );
};

const ChatPanel = ({ escrowId, bothJoined, isAdmin, hasJoined, status, buyerId, sellerId, className = "" }) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { data: conversations = [] } = useConversations();
  
  // Find conversation by escrowId
  const conversation = conversations.find(c => c.escrowId === escrowId);
  const conversationId = conversation?.id;

  const { data: messageData } = useConversationMessages(conversationId);
  const messages = messageData?.messages || [];
  
  const sendMutation = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId) return;
    sendMutation.mutate({ conversationId, content: messageText }, {
      onSuccess: () => setMessageText('')
    });
  };

  const isChatEnabled = (bothJoined && hasJoined) || isAdmin || status === 'success' || status === 'completed';

  return (
    <div className={`w-full lg:w-96 border-l border-[#3c4a45]/10 bg-[#131b2d] flex-col h-full shrink-0 relative ${className}`}>
      {!isChatEnabled && (
        <div className="absolute inset-0 bg-[#0b1325]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-[#bacac3] mb-4 opacity-50">lock</span>
          <h3 className="text-lg font-bold text-[#dbe2fb] mb-2">Chat Terkunci</h3>
          <p className="text-sm text-[#bacac3]">Kedua belah pihak harus bergabung ke transaksi sebelum chat dapat digunakan.</p>
        </div>
      )}

      {/* Chat Header */}
      <div className="p-4 border-b border-[#3c4a45]/10 flex items-center gap-3 bg-[#0b1325]/40 backdrop-blur-md shrink-0">
        <span className="material-symbols-outlined text-[#44e5c2]">chat</span>
        <h4 className="font-bold text-sm tracking-tight text-[#dbe2fb]">Diskusi Transaksi</h4>
        {isChatEnabled && <span className="ml-auto w-2 h-2 bg-[#44e5c2] rounded-full animate-pulse"></span>}
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          const isAdminMsg = msg.senderRole === 'admin';

          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-[#2d3448]/60 px-4 py-2 rounded-xl border border-[#44e5c2]/20 shadow-sm flex items-center gap-2 max-w-[90%]">
                  <span className="material-symbols-outlined text-[#44e5c2] text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <p className="text-[10px] text-[#44e5c2] font-semibold tracking-wide uppercase">{msg.content}</p>
                </div>
              </div>
            );
          }

          // ADMIN messages — distinct purple styling
          if (isAdminMsg && !isOwn) {
            return (
              <div key={msg.id} className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-purple-500/30 flex-shrink-0 flex items-center justify-center mt-1 border border-purple-500/40 ring-2 ring-purple-500/20">
                  <span className="material-symbols-outlined text-purple-300 text-sm">shield</span>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-300">{msg.senderUsername || 'Admin'}</span>
                    <RoleBadge role="admin" buyerId={buyerId} sellerId={sellerId} senderId={msg.senderId} />
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-[#dbe2fb] p-3 rounded-2xl rounded-tl-none shadow-sm text-left border border-purple-500/20">
                    <p className="text-xs leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-[9px] font-['JetBrains_Mono',monospace] text-[#bacac3] pl-1">{timeFormat(msg.createdAt)}</span>
                </div>
              </div>
            );
          }

          // OWN messages (could be admin's own messages too)
          if (isOwn) {
            return (
              <div key={msg.id} className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                <div className="flex flex-col items-end space-y-1 mt-1">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] font-bold text-[#bacac3]">Anda</span>
                    <RoleBadge role={isAdmin ? 'admin' : null} buyerId={buyerId} sellerId={sellerId} senderId={msg.senderId} />
                  </div>
                  <div className={`p-3 rounded-2xl rounded-tr-none shadow-sm text-left ${isAdmin ? 'bg-gradient-to-br from-purple-500/30 to-purple-600/20 text-[#dbe2fb] border border-purple-500/20' : 'bg-[#44e5c2] text-[#00382d]'}`}>
                    <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-[9px] font-['JetBrains_Mono',monospace] text-[#bacac3]">{timeFormat(msg.createdAt)}</span>
                </div>
              </div>
            );
          }

          // OTHER user messages (buyer/seller)
          return (
            <div key={msg.id} className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#2d3448] flex-shrink-0 flex items-center justify-center mt-1 border border-[#3c4a45]/30">
                <span className="material-symbols-outlined text-[#bacac3] text-sm">person</span>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#bacac3]">{msg.senderUsername || 'User'}</span>
                  <RoleBadge role={msg.senderRole} buyerId={buyerId} sellerId={sellerId} senderId={msg.senderId} />
                </div>
                <div className="bg-[#222a3d] text-[#dbe2fb] p-3 rounded-2xl rounded-tl-none shadow-sm text-left">
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[9px] font-['JetBrains_Mono',monospace] text-[#bacac3] pl-1">{timeFormat(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-[#3c4a45]/10 bg-[#0b1325]/80 backdrop-blur-md shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={!isChatEnabled || sendMutation.isPending}
            className="w-full bg-[#060e1f] border border-[#3c4a45]/20 rounded-full pl-4 pr-12 py-3 text-xs focus:ring-2 focus:ring-[#44e5c2]/30 focus:border-[#44e5c2]/50 outline-none transition-all placeholder:text-[#bacac3]/40 text-[#dbe2fb] disabled:opacity-50" 
            placeholder={isAdmin ? "Ketik pesan sebagai Admin..." : "Ketik pesan..."} 
            type="text" 
          />
          <button 
            type="submit"
            disabled={!isChatEnabled || !messageText.trim() || sendMutation.isPending}
            className={`absolute right-1.5 w-9 h-9 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 transition-all hover:scale-105 active:scale-95 ${isAdmin ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white' : 'bg-gradient-to-br from-[#00c9a7] to-[#00d2fd] text-[#00382d]'}`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
