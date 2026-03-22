import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const AnimatedThemeToggler = ({ mounted }) => {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            initial={{ rotate: isDark ? 0 : 180 }}
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.3 }}
        >
            {isDark ? <Sun /> : <Moon />}
        </motion.button>
    );
};

export default AnimatedThemeToggler;