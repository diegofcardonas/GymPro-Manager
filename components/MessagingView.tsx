
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
import { useTranslation } from 'react-i18next';

interface MessagingViewProps {
    preselectedContact?: User | null;
    onPreselectConsumed?: () => void;
}

const formatDateDivider = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'TODAY';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'YESTERDAY';
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const roleColors: Record<Role, string> = {
    [Role.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    [Role.CLIENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [Role.TRAINER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    [Role.RECEPTIONIST]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    [Role.GENERAL_MANAGER]: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
    [Role.GROUP_INSTRUCTOR]: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
    [Role.NUTRITIONIST]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [Role.PHYSIOTHERAPIST]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
};

const staffRoles = [Role.ADMIN, Role.TRAINER, Role.RECEPTIONIST, Role.GENERAL_MANAGER, Role.GROUP_INSTRUCTOR, Role.NUTRITIONIST, Role.PHYSIOTHERAPIST];

const MessagingView: React.FC<MessagingViewProps> = ({ preselectedContact, onPreselectConsumed }) => {
    const { t } = useTranslation();
    const { currentUser, users, messages, sendMessage, markMessagesAsRead, toggleBlockUser, myClients, myTrainers } = useContext(AuthContext);
    
    const [selectedContact, setSelectedContact] = useState<User | null>(preselectedContact || (users.length > 0 && window.innerWidth >= 768 ? users[1] : null));
    const [newMessage, setNewMessage] = useState('');
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
    const [showActiveChatsOnly, setShowActiveChatsOnly] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const optionsMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (preselectedContact && onPreselectConsumed) {
            setSelectedContact(preselectedContact);
            onPreselectConsumed();
        }
    }, [preselectedContact, onPreselectConsumed]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setIsOptionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const allContactsWithDetails = useMemo<(User & { lastMessage: Message | undefined; unreadCount: number; })[]>(() => {
        if (!currentUser) return [];

        const allOtherUsers = users.filter(u => u.id !== currentUser.id && !(currentUser.blockedUserIds || []).includes(u.id));

        const filteredUsers = allOtherUsers.filter(u => {
            const searchMatch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = selectedRoles.length === 0 || selectedRoles.includes(u.role);
            return searchMatch && roleMatch;
        });

        return filteredUsers.map(contact => {
            const contactIds = [currentUser.id, contact.id].sort();
            const conversationId = `${contactIds[0]}-${contactIds[1]}`;
            const conversationMessages = messages.filter(m => m.conversationId === conversationId);
            const lastMessage = conversationMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            const unreadCount = conversationMessages.filter(m => !m.isRead && m.receiverId === currentUser.id).length;
            return { ...contact, lastMessage, unreadCount };
        });
    }, [users, messages, currentUser, searchTerm, selectedRoles]);

    const contactsBySection = useMemo<Record<string, (User & { lastMessage: Message | undefined, unreadCount: number })[]>>(() => {
        if (!currentUser) return {};

        const sortedContacts = [...allContactsWithDetails].sort((a, b) => (b.lastMessage?.timestamp || 'a').localeCompare(a.lastMessage?.timestamp || 'b'));

        const sections: { [key: string]: typeof sortedContacts } = {};
        
        const mainContactSectionTitle = currentUser.role === Role.CLIENT ? t('components.messagingView.myTrainers') : t('components.messagingView.myClients');
        const mainContacts = currentUser.role === Role.CLIENT ? myTrainers : myClients;
        const mainContactIds = mainContacts?.map(c => c.id) || [];
        
        sections[mainContactSectionTitle] = sortedContacts.filter(u => mainContactIds.includes(u.id));
        sections[t('components.messagingView.staff')] = sortedContacts.filter(u => staffRoles.includes(u.role) && !mainContactIds.includes(u.id));
        sections[t('components.messagingView.clients')] = sortedContacts.filter(u => u.role === Role.CLIENT && !mainContactIds.includes(u.id));

        return Object.fromEntries(Object.entries(sections).filter(([_, users]) => users.length > 0));

    }, [currentUser, allContactsWithDetails, myClients, myTrainers, t]);
    
    const activeChats = useMemo(() => {
        return allContactsWithDetails
            .filter(c => c.lastMessage)
            .sort((a, b) => (b.lastMessage?.timestamp || 'a').localeCompare(a.lastMessage?.timestamp || 'b'));
    }, [allContactsWithDetails]);

    const conversationMessages = useMemo(() => {
        if (!currentUser || !selectedContact) return [];
        const contactIds = [currentUser.id, selectedContact.id].sort();
        const conversationId = `${contactIds[0]}-${contactIds[1]}`;
        
        const blockedByCurrentUser = currentUser.blockedUserIds?.includes(selectedContact.id);
        const blockedByContact = selectedContact.blockedUserIds?.includes(currentUser.id);
        
        if (blockedByCurrentUser || blockedByContact) return [];
        
        return messages
            .filter(m => m.conversationId === conversationId)
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, currentUser, selectedContact]);

    useEffect(() => {
        if (currentUser && selectedContact) {
            const contactIds = [currentUser.id, selectedContact.id].sort();
            const conversationId = `${contactIds[0]}-${contactIds[1]}`;
            markMessagesAsRead(conversationId, currentUser.id);
        }
    }, [selectedContact, currentUser, markMessagesAsRead, conversationMessages]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [conversationMessages]);
    
    const submitMessage = () => {
        if (!newMessage.trim() || !currentUser || !selectedContact) return;
        const contactIds = [currentUser.id, selectedContact.id].sort();
        sendMessage({
            conversationId: `${contactIds[0]}-${contactIds[1]}`,
            senderId: currentUser.id,
            receiverId: selectedContact.id,
            text: newMessage.trim(),
        });
        setNewMessage('');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitMessage();
    };

    const handleBlockToggle = () => {
        if (!selectedContact) return;
        const isBlocked = currentUser?.blockedUserIds?.includes(selectedContact.id);
        const actionKey = isBlocked ? 'confirmUnblock' : 'confirmBlock';
        if (window.confirm(t(`components.messagingView.${actionKey}`, { name: selectedContact.name }))) {
            toggleBlockUser(selectedContact.id);
            setIsOptionsOpen(false);
            if (!isBlocked) {
                setSelectedContact(null); // Close chat window if blocking
            }
        }
    };

    const messagesWithDividers = useMemo(() => {
        const result: (Message | { type: 'divider'; date: string, id: string })[] = [];
        let lastDate: string | null = null;
        conversationMessages.forEach(msg => {
            const msgDate = new Date(msg.timestamp).toLocaleDateString();
            if (msgDate !== lastDate) {
                const rawLabel = formatDateDivider(msg.timestamp);
                const label = rawLabel === 'TODAY' ? t('components.messagingView.today') : 
                              rawLabel === 'YESTERDAY' ? t('components.messagingView.yesterday') : rawLabel;
                
                result.push({ type: 'divider', date: label, id: `divider-${msg.timestamp}` });
                lastDate = msgDate;
            }
            result.push(msg);
        });
        return result;
    }, [conversationMessages, t]);

    const toggleSection = (sectionName: string) => {
        setCollapsedSections(prev => 
            prev.includes(sectionName)
                ? prev.filter(s => s !== sectionName)
                : [...prev, sectionName]
        );
    };
    
    type ContactWithDetails = User & { lastMessage: Message | undefined, unreadCount: number };

    const renderContact = (contact: ContactWithDetails) => (
        <button 
            key={contact.id}
            onClick={() => setSelectedContact(contact)}
            className={`w-full text-left p-3 flex items-center space-x-3 transition-colors border-l-4 ${selectedContact?.id === contact.id ? 'bg-primary/10 border-primary' : 'border-transparent hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}
        >
            <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                    <p className={`font-semibold truncate ${selectedContact?.id === contact.id ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>{contact.name}</p>
                </div>
                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleColors[contact.role]}`}>{contact.role.charAt(0).toUpperCase() + contact.role.slice(1).toLowerCase().replace(/_/g, ' ')}</span>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage?.text || t('components.messagingView.noActiveChats')}</p>
                    {contact.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{contact.unreadCount}</span>
                    )}
                </div>
            </div>
        </button>
    );

    return (
        <div className="w-full max-w-6xl h-[calc(100dvh-100px)] md:h-[80vh] bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 flex overflow-hidden">
            {/* Contacts List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('components.messagingView.title')}</h2>
                    <div className="relative mt-2">
                        <input
                            type="text"
                            placeholder={t('components.messagingView.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 bg-gray-200 dark:bg-gray-700 rounded-lg border-transparent focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        />
                        <button onClick={() => setIsFilterModalOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600">
                            <FilterIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <label htmlFor="active-chats-toggle" className="flex items-center cursor-pointer">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">{t('components.messagingView.showActiveChats')}</span>
                        <div className="relative">
                            <input type="checkbox" id="active-chats-toggle" className="sr-only peer" checked={showActiveChatsOnly} onChange={() => setShowActiveChatsOnly(!showActiveChatsOnly)} />
                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary"></div>
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                    </label>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {showActiveChatsOnly ? (
                         activeChats.length > 0 ? (
                            activeChats.map(contact => renderContact(contact as ContactWithDetails))
                        ) : (
                            <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">{t('components.messagingView.noActiveChats')}</p>
                        )
                    ) : (
                        Object.entries(contactsBySection).map(([sectionName, contacts]: [string, ContactWithDetails[]]) => (
                            <div key={sectionName}>
                                <button onClick={() => toggleSection(sectionName)} className="w-full flex justify-between items-center p-2 px-3 bg-gray-200/50 dark:bg-gray-800/50 sticky top-0 z-10">
                                    <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{sectionName} ({contacts.length})</h3>
                                    {collapsedSections.includes(sectionName) ? <ChevronDownIcon className="w-5 h-5 text-gray-500"/> : <ChevronUpIcon className="w-5 h-5 text-gray-500"/> }
                                </button>
                                {!collapsedSections.includes(sectionName) && contacts.map(contact => renderContact(contact))}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`w-full md:w-2/3 flex flex-col chat-bg ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
                {selectedContact ? (
                    <>
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                             <div className="flex items-center space-x-3">
                                <button onClick={() => setSelectedContact(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <BackArrowIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </button>
                                <img src={selectedContact.avatarUrl} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedContact.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{selectedContact.role.toLowerCase().replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                            <div className="relative" ref={optionsMenuRef}>
                                <button onClick={() => setIsOptionsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <DotsVerticalIcon className="w-6 h-6 text-gray-600 dark:text-gray-400"/>
                                </button>
                                {isOptionsOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                        <button onClick={handleBlockToggle} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <BlockIcon className="w-5 h-5"/>
                                            <span>{currentUser?.blockedUserIds?.includes(selectedContact.id) ? t('components.messagingView.unblock') : t('components.messagingView.block')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2">
                            {messagesWithDividers.map(item => {
                                if ('type' in item && item.type === 'divider') {
                                    return (
                                        <div key={item.id} className="flex justify-center my-4">
                                            <span className="px-3 py-1 bg-gray-200/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 text-xs font-semibold rounded-full">{item.date}</span>
                                        </div>
                                    )
                                }
                                const msg = item as Message;
                                const isSentByMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative max-w-[80%] md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg shadow ${isSentByMe ? 'bg-primary text-primary-foreground bubble-sent' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 bubble-received'}`}>
                                            <p className="text-sm break-words">{msg.text}</p>
                                            <div className="flex items-center justify-end gap-1.5 mt-1 -mb-1">
                                                <span className={`text-xs ${isSentByMe ? 'text-primary-foreground/70' : 'text-gray-500 dark:text-gray-400/70'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isSentByMe && (
                                                    <CheckIcon double className={`w-4 h-4 ${msg.isRead ? 'text-blue-400' : 'text-primary-foreground/70'}`} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <div className="flex items-center space-x-3 bg-white dark:bg-gray-700 rounded-full px-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={t('components.messagingView.messagePlaceholder', { name: selectedContact.name })}
                                    className="flex-grow p-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            submitMessage();
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="w-10 h-10 flex-shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-all duration-200 transform disabled:bg-gray-400 disabled:scale-75"
                                    disabled={!newMessage.trim()}
                                    aria-label="Send message"
                                >
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 items-center justify-center text-center text-gray-500 dark:text-gray-400 hidden md:flex">
                        <p>{t('components.messagingView.startMessaging')}</p>
                    </div>
                )}
            </div>
             {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm animate-scale-in">
                        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('components.messagingView.filterByRole')}</h3>
                             <button onClick={() => setIsFilterModalOpen(false)}><XCircleIcon className="w-6 h-6 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"/></button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
                            {Object.values(Role).map(role => (
                                <label key={role} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => {
                                            setSelectedRoles(prev => 
                                                prev.includes(role) 
                                                    ? prev.filter(r => r !== role)
                                                    : [...prev, role]
                                            );
                                        }}
                                        className="form-checkbox h-4 w-4 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm capitalize text-gray-700 dark:text-gray-200">{role.toLowerCase().replace(/_/g, ' ')}</span>
                                </label>
                            ))}
                        </div>
                         <div className="p-4 flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700">
                             <button onClick={() => { setSelectedRoles([]); setIsFilterModalOpen(false); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-sm text-gray-800 dark:text-white">{t('components.messagingView.clear')}</button>
                             <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">{t('components.messagingView.apply')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagingView;
