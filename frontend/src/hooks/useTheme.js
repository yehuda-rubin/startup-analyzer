const useTheme = (role) => {
    // Default to 'entrepreneur' theme fallback
    const isInvestor = role === 'investor';

    return {
        // Core Identity
        isInvestor,
        name: isInvestor ? 'Investor' : 'Entrepreneur',

        // Colors (Tailwind Classes) - Light Mode
        primary: isInvestor ? 'emerald' : 'indigo',
        accent: isInvestor ? 'teal' : 'purple',

        // Structure & Backgrounds - LIGHT MODE PIVOT
        pageBg: 'bg-slate-50',
        contentBg: 'bg-white',
        sidebarBg: 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm',

        // Component Styles - Cards
        card: `relative overflow-hidden rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md transition-all duration-300 hover:border-indigo-300/50 hover:shadow-xl hover:shadow-${isInvestor ? 'emerald' : 'indigo'}-500/10 group`,

        // Component Styles - Glass Panels
        glass: 'bg-white/40 backdrop-blur-lg border border-white/40 shadow-sm',
        glassPanel: 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg',

        // Typography - Dark Text for Light Mode
        titleGradient: isInvestor
            ? 'bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-teal-700'
            : 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-purple-700',

        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-500',

        // Interactive Elements
        buttonPrimary: `relative overflow-hidden px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all duration-300 transform active:scale-95 
            ${isInvestor
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/20'}`,

        buttonSecondary: 'px-4 py-2 rounded-lg text-slate-600 font-medium hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100',

        // Navigation (Toolbar)
        navItemActive: isInvestor
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm ring-1 ring-emerald-200'
            : 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-200',
        navItemInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50',

        // Status Indicators
        badge: isInvestor
            ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200',

        // Form Elements
        input: `w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm
            ${isInvestor
                ? 'focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-emerald-300'
                : 'focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-indigo-300'}`,
    };
};

export default useTheme;
