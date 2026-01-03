
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '../icons/HeartIcon';
import { ChatBubbleLeftIcon } from '../icons/ChatBubbleLeftIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { SendIcon } from '../icons/SendIcon';
import { CameraIcon } from '../icons/CameraIcon';

const SocialFeed: React.FC = () => {
    const { t } = useTranslation();
    const { posts, currentUser, likePost, addPost } = useContext(AuthContext);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !currentUser) return;

        setIsPosting(true);
        setTimeout(() => {
            addPost({
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatarUrl,
                content: newPostContent.trim(),
                type: 'general'
            });
            setNewPostContent('');
            setIsPosting(false);
        }, 600);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between px-4 sm:px-0">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">{t('client.social.title')}</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {t('client.social.live')}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 sm:rounded-3xl shadow-sm border border-black/5 p-4 animate-fade-in">
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <div className="flex gap-4">
                        <img src={currentUser?.avatarUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                        <textarea 
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                            placeholder={t('client.social.placeholder', { name: currentUser?.name.split(' ')[0] })}
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
                        />
                    </div>
                    <div className="flex justify-between items-center pl-16">
                        <button type="button" className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold">
                            <CameraIcon className="w-5 h-5" />
                            <span>{t('client.social.photoVideo')}</span>
                        </button>
                        <button 
                            type="submit" 
                            disabled={!newPostContent.trim() || isPosting}
                            className="px-6 py-2 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPosting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <SendIcon className="w-4 h-4" />}
                            {t('client.social.post')}
                        </button>
                    </div>
                </form>
            </div>

            {posts.length > 0 ? posts.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-800 sm:rounded-3xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden animate-slide-up">
                    <div className="p-4 flex items-center gap-3">
                        <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover border border-black/5" />
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
                        <p className="text-gray-800 dark:text-gray-200 text-sm md:text-base leading-relaxed">{post.content}</p>
                    </div>

                    {post.imageUrl && (
                        <img src={post.imageUrl} className="w-full aspect-video object-cover" />
                    )}

                    <div className="p-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center gap-6">
                        <button 
                            onClick={() => currentUser && likePost(post.id, currentUser.id)}
                            className={`flex items-center gap-2 transition-all ${post.likes.includes(currentUser?.id || '') ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
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
                    <TrophyIcon className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="font-bold text-gray-400">{t('client.social.noPosts')}</p>
                    <p className="text-sm text-gray-400">{t('client.social.firstPost')}</p>
                </div>
            )}
        </div>
    );
};

export default SocialFeed;
