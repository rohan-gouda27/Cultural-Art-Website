import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Send, MessageCircle } from 'lucide-react';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const toParam = searchParams.get('to');
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(toParam || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/messages/conversations').then(({ data }) => setConversations(data.conversations || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.token) return;
    const token = localStorage.getItem('token');
    const socketUrl = window.location.port === '3000' ? 'http://localhost:5000' : window.location.origin;
    const s = io(socketUrl, { auth: { token } });
    s.on('new_message', (msg) => setMessages((m) => [...m, msg]));
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  useEffect(() => {
    if (selectedUserId) {
      api.get(`/messages/${selectedUserId}`).then(({ data }) => setMessages(data.messages || [])).catch(() => setMessages([]));
    } else {
      setMessages([]);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (toParam && !selectedUserId) setSelectedUserId(toParam);
  }, [toParam]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUserId) return;
    if (socket) {
      socket.emit('send_message', { receiverId: selectedUserId, content: newMessage.trim() });
      setNewMessage('');
    } else {
      api.post('/messages', { receiverId: selectedUserId, content: newMessage.trim() }).then(({ data }) => {
        setMessages((m) => [...m, data.message]);
        setNewMessage('');
      }).catch(() => {});
    }
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
              <div className="p-4 border-b border-surface-200 dark:border-surface-700">
                <p className="font-medium text-surface-900 dark:text-surface-100">
                  {selectedConv?.otherUser?.displayName || selectedConv?.otherUser?.name || 'User'}
                </p>
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
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button onClick={sendMessage} className="btn-primary p-2">
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
