
import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Role, Message } from '../types';
import { SendIcon } from './icons/SendIcon';
import { CheckIcon } from './icons/CheckIcon';
import { BackArrowIcon } from './icons/BackArrowIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { BlockIcon } from './icons/BlockIcon';
import { FilterIcon } from './icons/FilterIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { XCircleIcon } from './icons/XCircleIcon';
// FIX: Imported LogoIcon to resolve the 'Cannot find name' error on line 127.
import { LogoIcon } from './icons/LogoIcon';
import { useTranslation } from 'react-i18next';

const roleColors: Record<Role, string> = {
    [Role.ADMIN]: 'bg-red-100 text-red-800',
    [Role.CLIENT]: 'bg-blue-100 text-blue-800',
    [Role.TRAINER]: 'bg-purple-100 text-purple-800',
    [Role.RECEPTIONIST]: 'bg-indigo-100 text-indigo-800',
    [Role.GENERAL_MANAGER]: 'bg-gray-100 text-gray-800',
    [Role.GROUP_INSTRUCTOR]: 'bg-pink-100 text-pink-800',
    [Role.NUTRITIONIST]: 'bg-green-100 text-green-800',
    [Role.PHYSIOTHERAPIST]: 'bg-teal-100 text-teal-800',
};

const MessagingView: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, users, messages, sendMessage, markMessagesAsRead, toggleBlockUser } = useContext(AuthContext);
    const [selectedContact, setSelectedContact] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const activeConversations = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => u.id !== currentUser.id)
            .map(contact => {
                const convId = [currentUser.id, contact.id].sort().join('-');
                const convMsgs = messages.filter(m => m.conversationId === convId);
                const lastMsg = convMsgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                return { ...contact, lastMsg };
            })
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a,b) => (b.lastMsg?.timestamp || '').localeCompare(a.lastMsg?.timestamp || ''));
    }, [users, messages, currentUser, searchTerm]);

    const conversationMessages = useMemo(() => {
        if (!currentUser || !selectedContact) return [];
        const convId = [currentUser.id, selectedContact.id].sort().join('-');
        return messages.filter(m => m.conversationId === convId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, currentUser, selectedContact]);

    useEffect(() => {
        if (currentUser && selectedContact) {
            const convId = [currentUser.id, selectedContact.id].sort().join('-');
            markMessagesAsRead(convId, currentUser.id);
        }
    }, [selectedContact, currentUser, markMessagesAsRead]);
    
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'auto' }); }, [conversationMessages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !selectedContact) return;
        sendMessage({
            conversationId: [currentUser.id, selectedContact.id].sort().join('-'),
            senderId: currentUser.id,
            receiverId: selectedContact.id,
            text: newMessage.trim(),
        });
        setNewMessage('');
    };

    return (
        <div className="w-full max-w-6xl h-[calc(100vh-160px)] md:h-[75vh] bg-white dark:bg-gray-800 rounded-4xl shadow-xl flex overflow-hidden border border-black/5 animate-fade-in">
            <div className={`w-full md:w-80 border-r border-black/5 flex flex-col bg-gray-50/30 dark:bg-gray-900/20 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-black/5">
                    <h2 className="text-2xl font-black tracking-tighter mb-4">Chat</h2>
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {activeConversations.map(contact => (
                        <button key={contact.id} onClick={() => setSelectedContact(contact)} className={`w-full p-4 flex items-center gap-3 transition-all ${selectedContact?.id === contact.id ? 'bg-white dark:bg-gray-800 shadow-sm' : 'hover:bg-black/5'}`}>
                            <img src={contact.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" />
                            <div className="flex-1 text-left min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white truncate">{contact.name}</p>
                                <p className="text-xs text-gray-400 truncate font-medium">{contact.lastMsg?.text || 'Sin mensajes'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className={`flex-1 flex flex-col chat-bg ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
                {selectedContact ? (
                    <>
                        <div className="p-4 glass border-b border-black/5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedContact(null)} className="md:hidden p-2"><BackArrowIcon className="w-6 h-6" /></button>
                                <img src={selectedContact.avatarUrl} className="w-10 h-10 rounded-full border-2 border-white" />
                                <div><p className="font-black text-gray-900 dark:text-white">{selectedContact.name}</p><p className="text-[10px] font-bold text-primary uppercase">{selectedContact.role}</p></div>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {conversationMessages.map(msg => {
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                        <div className={`max-w-[80%] px-4 py-2 shadow-sm ${isMe ? 'bg-primary text-white rounded-3xl rounded-tr-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-3xl rounded-tl-none'}`}>
                                            <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                                            <div className="flex justify-end gap-1 mt-1 opacity-50"><span className="text-[9px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>{isMe && <CheckIcon className="w-3 h-3" />}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSend} className="p-4 glass border-t border-black/5">
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-3xl p-1 shadow-inner border border-black/5">
                                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-transparent border-none p-3 text-sm focus:ring-0" />
                                <button type="submit" className="p-3 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"><SendIcon className="w-5 h-5" /></button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20"><LogoIcon className="w-32 h-32 mb-4 grayscale" /><p className="font-black text-xl">GymPro Connect</p></div>
                )}
            </div>
        </div>
    );
};

export default MessagingView;
