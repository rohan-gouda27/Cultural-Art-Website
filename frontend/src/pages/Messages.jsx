import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Send, MessageCircle, CheckCircle, UserPlus } from 'lucide-react';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const toParam = searchParams.get('to');
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(toParam || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const socketUrl = window.location.port === '3000' ? 'http://localhost:5000' : window.location.origin;
    const s = io(socketUrl, { auth: { token } });
    s.on('new_message', (payload) => {
      const msg = payload?.message || payload;
      if (msg) setMessages((m) => [...m, msg]);
      if (payload?.warning) toast.error(payload.warning, { duration: 5000 });
    });
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  useEffect(() => {
    if (selectedUserId) {
      api.get(`/messages/${selectedUserId}`).then(({ data }) => setMessages(data.messages || [])).catch(() => setMessages([]));
      api.get(`/messages/${selectedUserId}/status`).then(({ data }) => setIsFinalized(!!data.isFinalized)).catch(() => setIsFinalized(false));
      api.get(`/users/profile/${selectedUserId}`).then(({ data }) => {
        setSelectedUserInfo({ ...data.user, displayName: data.artist?.displayName || data.user?.name });
        setSelectedArtistId(data.artist?._id || null);
      }).catch(() => { setSelectedUserInfo(null); setSelectedArtistId(null); });
    } else {
      setMessages([]);
      setSelectedUserInfo(null);
      setSelectedArtistId(null);
      setIsFinalized(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (toParam && !selectedUserId) setSelectedUserId(toParam);
  }, [toParam]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = () => {
    api.get('/messages/conversations').then(({ data }) => setConversations(data.conversations || [])).catch(() => {});
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUserId) return;
    const content = newMessage.trim();
    setNewMessage('');
    if (socket?.connected) {
      socket.emit('send_message', { receiverId: selectedUserId, content });
      loadConversations();
    } else {
      api.post('/messages', { receiverId: selectedUserId, content }).then(({ data }) => {
        setMessages((m) => [...m, data.message]);
        if (data.warning) toast.error(data.warning, { duration: 5000 });
        loadConversations();
      }).catch(() => setNewMessage(content));
    }
  };

  const handleFinalizeChat = () => {
    api.post(`/messages/${selectedUserId}/finalize`).then(() => {
      setIsFinalized(true);
      toast.success('Chat finalized. You can still view the conversation.');
    }).catch(() => toast.error('Could not finalize chat'));
  };

  const otherUserFromConversation = (c) => c.otherUser;
  const selectedConv = conversations.find((c) => (c.otherUser?._id || c.otherUser?.id) === selectedUserId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-6">Messages</h1>
      <div className="card overflow-hidden flex flex-col sm:flex-row" style={{ minHeight: '500px' }}>
        <div className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-surface-200 dark:border-surface-700 flex flex-col">
          {conversations.length === 0 && !selectedUserId && (
            <p className="p-4 text-surface-500 dark:text-surface-400 text-sm">No conversations yet. Message an artist from their profile.</p>
          )}
          {conversations.map((c) => {
            const other = c.otherUser;
            const id = other?._id || other?.id;
            const name = other?.displayName || other?.name || 'User';
            const isSelected = id === selectedUserId;
            return (
              <button
                key={c.conversationId || id}
                onClick={() => setSelectedUserId(id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-surface-50 dark:hover:bg-surface-800 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500' : ''}`}
              >
                <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{name}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400 truncate">{c.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-surface-900 dark:text-surface-100">
                  {selectedConv?.otherUser?.displayName || selectedConv?.otherUser?.name || selectedUserInfo?.name || selectedUserInfo?.displayName || 'User'}
                </p>
                <div className="flex items-center gap-2">
                  {selectedArtistId && (
                    <Link to={`/?request=1&artist=${selectedArtistId}`} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4" /> Hire artist
                    </Link>
                  )}
                  {!isFinalized ? (
                    <button type="button" onClick={handleFinalizeChat} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Finalize chat
                    </button>
                  ) : (
                    <span className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Finalized
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMe = m.sender?._id === user?.id || m.sender === user?.id;
                  return (
                    <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100'}`}>
                        <p className="text-sm">{m.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-4 border-t border-surface-200 dark:border-surface-700 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isFinalized && sendMessage()}
                  placeholder={isFinalized ? 'This chat is finalized.' : 'Type a message...'}
                  className="input-field flex-1"
                  disabled={isFinalized}
                />
                <button onClick={sendMessage} className="btn-primary p-2" disabled={isFinalized} title={isFinalized ? 'Chat finalized' : 'Send'}>
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-surface-500 dark:text-surface-400">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a conversation or message an artist from their profile.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
