import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Dark Base */}
            <div className="absolute inset-0 bg-background" />

            {/* Glowing Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 400, 0],
                    y: [0, 300, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 blur-[120px] rounded-full"
            />

            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, -300, 0],
                    y: [0, 200, 0],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                    delay: 5
                }}
                className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-secondary/20 blur-[120px] rounded-full"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 200, 0],
                    y: [0, -200, 0],
                    opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                    delay: 10
                }}
                className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-accent/10 blur-[120px] rounded-full"
            />

            {/* Mesh Grid Overlay (Optional for Cyberpunk feel) */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        </div>
    );
};

export default AnimatedBackground;
