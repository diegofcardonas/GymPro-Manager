
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '../icons/HeartIcon';
import { ChatBubbleLeftIcon } from '../icons/ChatBubbleLeftIcon';
import { TrophyIcon } from '../icons/TrophyIcon';

const SocialFeed: React.FC = () => {
    const { t } = useTranslation();
    const { posts, currentUser, likePost } = useContext(AuthContext);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between px-4 sm:px-0">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Muro Social</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Comunidad en Vivo
                </div>
            </div>

            {posts.length > 0 ? posts.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-800 sm:rounded-3xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden animate-slide-up">
                    <div className="p-4 flex items-center gap-3">
                        <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white leading-none">{post.userName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        {post.type === 'achievement' && (
                            <div className="ml-auto p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                <TrophyIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        )}
                    </div>

                    <div className="px-4 pb-4">
                        <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                    </div>

                    {post.imageUrl && (
                        <img src={post.imageUrl} className="w-full aspect-video object-cover" />
                    )}

                    <div className="p-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center gap-6">
                        <button 
                            onClick={() => currentUser && likePost(post.id, currentUser.id)}
                            className={`flex items-center gap-2 transition-all ${post.likes.includes(currentUser?.id || '') ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        >
                            <HeartIcon className={`w-6 h-6 ${post.likes.includes(currentUser?.id || '') ? 'fill-current' : ''}`} />
                            <span className="text-sm font-black">{post.likes.length}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all">
                            <ChatBubbleLeftIcon className="w-6 h-6" />
                            <span className="text-sm font-black">{post.comments.length}</span>
                        </button>
                    </div>
                </div>
            )) : (
                <div className="py-20 text-center flex flex-col items-center justify-center opacity-50">
                    <TrophyIcon className="w-16 h-16 mb-4" />
                    <p className="font-bold">Aún no hay publicaciones sociales.</p>
                    <p className="text-sm">¡Comienza a entrenar para ver tus logros aquí!</p>
                </div>
            )}
        </div>
    );
};

export default SocialFeed;
