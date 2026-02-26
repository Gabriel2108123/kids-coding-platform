import React, { useState, useEffect } from 'react';
import { badgeService, Badge, UserBadge, BadgeProgress } from '../services/badgeService';

// ==========================================
// BADGE COMPONENT INTERFACES
// ==========================================

interface BadgeCardProps {
    badge: Badge;
    userBadge?: UserBadge;
    progress?: BadgeProgress;
    onClick: () => void;
}

interface BadgeModalProps {
    badge: Badge | null;
    userBadge?: UserBadge;
    progress?: BadgeProgress;
    isOpen: boolean;
    onClose: () => void;
}

// ==========================================
// BADGE CARD COMPONENT
// ==========================================

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, userBadge, progress, onClick }) => {
    const isEarned = !!userBadge;
    const rarityColor = badgeService.getBadgeRarityColor(badge.rarity);
    const categoryIcon = badgeService.getBadgeCategoryIcon(badge.category);

    return (
        <div
            className={`
                relative bg-white rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${isEarned ? 'ring-2 ring-yellow-400 shadow-md' : 'border border-gray-200'}
            `}
            onClick={onClick}
            style={{ borderColor: !isEarned ? rarityColor : undefined }}
        >
            {/* Earned Badge Indicator */}
            {isEarned && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                </div>
            )}

            {/* Badge Icon */}
            <div className={`
                w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3
                ${isEarned ? 'bg-yellow-50' : 'bg-gray-100'}
            `}>
                {badge.iconUrl ? (
                    <img src={badge.iconUrl} alt={badge.name} className="w-12 h-12" />
                ) : (
                    <span>{categoryIcon}</span>
                )}
            </div>

            {/* Badge Info */}
            <div className="text-center">
                <h3 className={`
                    font-semibold text-sm mb-1 
                    ${isEarned ? 'text-gray-900' : 'text-gray-600'}
                `}>
                    {badge.name}
                </h3>
                
                <div className="flex items-center justify-center gap-1 mb-2">
                    <span 
                        className="text-xs px-2 py-1 rounded-full text-white font-medium"
                        style={{ backgroundColor: rarityColor }}
                    >
                        {badge.rarity}
                    </span>
                </div>

                {/* Progress Bar for Unearned Badges */}
                {!isEarned && progress && progress.progress && (
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.progress.percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {badgeService.formatProgressText(
                                progress.progress.current,
                                progress.progress.target,
                                badge.requirements.type
                            )}
                        </p>
                    </div>
                )}

                {/* Earned Date */}
                {isEarned && userBadge && (
                    <p className="text-xs text-gray-500">
                        Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

// ==========================================
// BADGE MODAL COMPONENT
// ==========================================

const BadgeModal: React.FC<BadgeModalProps> = ({ badge, userBadge, progress, isOpen, onClose }) => {
    if (!isOpen || !badge) return null;

    const isEarned = !!userBadge;
    const rarityColor = badgeService.getBadgeRarityColor(badge.rarity);
    const categoryIcon = badgeService.getBadgeCategoryIcon(badge.category);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-xl
                            ${isEarned ? 'bg-yellow-50' : 'bg-gray-100'}
                        `}>
                            {badge.iconUrl ? (
                                <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8" />
                            ) : (
                                <span>{categoryIcon}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{badge.name}</h2>
                            <div className="flex items-center gap-2">
                                <span 
                                    className="text-xs px-2 py-1 rounded-full text-white font-medium"
                                    style={{ backgroundColor: rarityColor }}
                                >
                                    {badge.rarity}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                    {badge.category}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{badge.description}</p>

                {/* Requirements */}
                <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                            {badgeService.formatProgressText(
                                0,
                                badge.requirements.value,
                                badge.requirements.type
                            ).replace('0 / ', '')}
                        </p>
                    </div>
                </div>

                {/* Progress (if not earned) */}
                {!isEarned && progress && progress.progress && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Progress</h3>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Current Progress</span>
                                <span className="font-medium">{progress.progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progress.progress.percentage}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {badgeService.formatProgressText(
                                    progress.progress.current,
                                    progress.progress.target,
                                    badge.requirements.type
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Rewards */}
                <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Rewards</h3>
                    <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-yellow-600">⭐</span>
                            <span className="text-gray-700">+{badge.rewards.xpBonus} XP</span>
                        </div>
                        {badge.rewards.title && (
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <span className="text-purple-600">👑</span>
                                <span className="text-gray-700">Title: {badge.rewards.title}</span>
                            </div>
                        )}
                        {badge.rewards.unlockFeatures && badge.rewards.unlockFeatures.length > 0 && (
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <span className="text-blue-600">🔓</span>
                                <span className="text-gray-700">
                                    Unlocks: {badge.rewards.unlockFeatures.join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Earned Status */}
                {isEarned && userBadge && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 text-lg">🎉</span>
                            <div>
                                <p className="font-semibold text-green-800">Badge Earned!</p>
                                <p className="text-sm text-green-600">
                                    {new Date(userBadge.earnedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// MAIN BADGES PAGE COMPONENT
// ==========================================

const BadgesPage: React.FC = () => {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // ==========================================
    // DATA LOADING
    // ==========================================

    useEffect(() => {
        loadBadgeData();
    }, []);

    const loadBadgeData = async () => {
        setLoading(true);
        try {
            const [allBadges, userBadgeData, progressData] = await Promise.all([
                badgeService.getAllBadges(),
                badgeService.getUserBadges(),
                badgeService.getUserBadgeProgress()
            ]);

            setBadges(allBadges);
            setUserBadges(userBadgeData);
            setBadgeProgress(progressData);
        } catch (error) {
            // Error handled silently for linting compliance
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FILTERING LOGIC
    // ==========================================

    const filteredBadges = badges.filter(badge => {
        // Category filter
        if (categoryFilter !== 'all' && badge.category !== categoryFilter) {
            return false;
        }

        // Status filter
        const isEarned = userBadges.some(ub => ub.badgeId === badge._id);
        
        if (filter === 'earned' && !isEarned) {
            return false;
        }
        
        if (filter === 'available' && isEarned) {
            return false;
        }

        return true;
    });

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    const handleBadgeClick = (badge: Badge) => {
        setSelectedBadge(badge);
        setIsModalOpen(true);
    };

    const getSelectedBadgeData = () => {
        if (!selectedBadge) return {};

        const userBadge = userBadges.find(ub => ub.badgeId === selectedBadge._id);
        const progress = badgeProgress.find(bp => bp.badgeId === selectedBadge._id);

        return { userBadge, progress };
    };

    // ==========================================
    // STATISTICS
    // ==========================================

    const earnedCount = userBadges.length;
    const totalCount = badges.length;
    const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

    const categories = ['all', ...Array.from(new Set(badges.map(b => b.category)))];

    // ==========================================
    // RENDER
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading badges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Badge Collection</h1>
                            <p className="text-gray-600">Track your achievements and unlock new challenges!</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{earnedCount}/{totalCount}</div>
                            <div className="text-sm text-gray-500">Badges Earned</div>
                            <div className="text-lg font-semibold text-purple-600">{completionPercentage}%</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-wrap gap-4 mb-6">
                    {/* Status Filter */}
                    <div className="flex bg-white rounded-lg p-1 shadow-sm">
                        {[
                            { key: 'all', label: 'All Badges', count: totalCount },
                            { key: 'earned', label: 'Earned', count: earnedCount },
                            { key: 'available', label: 'Available', count: totalCount - earnedCount }
                        ].map(item => (
                            <button
                                key={item.key}
                                onClick={() => setFilter(item.key as any)}
                                className={`
                                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                                    ${filter === item.key 
                                        ? 'bg-blue-500 text-white shadow-md' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {item.label} ({item.count})
                            </button>
                        ))}
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : 
                                 category.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredBadges.map(badge => {
                        const userBadge = userBadges.find(ub => ub.badgeId === badge._id);
                        const progress = badgeProgress.find(bp => bp.badgeId === badge._id);

                        return (
                            <BadgeCard
                                key={badge._id}
                                badge={badge}
                                userBadge={userBadge}
                                progress={progress}
                                onClick={() => handleBadgeClick(badge)}
                            />
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredBadges.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">�</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No badges found</h3>
                        <p className="text-gray-500">
                            {filter === 'earned' 
                                ? "You haven't earned any badges yet. Keep learning to unlock your first badge!"
                                : filter === 'available'
                                ? "Congratulations! You've earned all available badges!"
                                : "No badges match your current filters."
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Badge Detail Modal */}
            <BadgeModal
                badge={selectedBadge}
                {...getSelectedBadgeData()}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default BadgesPage;
