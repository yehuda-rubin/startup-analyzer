const useTheme = (role) => {
    // Default to 'entrepreneur' theme fallback or neutral if needed
    const isInvestor = role === 'investor';

    return {
        // Colors
        primary: isInvestor ? 'emerald' : 'indigo',
        accent: isInvestor ? 'teal' : 'purple',

        // Backgrounds (Gradients)
        bgGradient: isInvestor
            ? 'from-slate-900 via-emerald-950/20 to-slate-950'
            : 'from-slate-900 via-indigo-950/20 to-slate-950',

        // Button Styles
        buttonPrimary: isInvestor
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20',

        // Text Styles
        textPrimary: isInvestor ? 'text-emerald-400' : 'text-indigo-400',
        textAccent: isInvestor ? 'text-teal-300' : 'text-purple-300',

        // Borders
        borderPrimary: isInvestor ? 'border-emerald-500/50' : 'border-indigo-500/50',

        // Icons
        iconBg: isInvestor ? 'bg-emerald-500/20' : 'bg-indigo-500/20',
        iconColor: isInvestor ? 'text-emerald-400' : 'text-indigo-400',

        // Badge
        badge: isInvestor
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',

        // Inputs (Glows)
        inputFocus: isInvestor
            ? 'focus:ring-emerald-500/50 focus:border-emerald-500/50'
            : 'focus:ring-indigo-500/50 focus:border-indigo-500/50',

        // Gradients & Accents
        accentGradient: isInvestor
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500',
    };
};

export default useTheme;
