import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLiquidNav, setShowLiquidNav] = useState(false);

  // Mouse position for liquid nav effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });

  // Liquid blob transforms
  const blobX = useTransform(smoothX, [0, 100], [0, -20]);
  const blobScale = useTransform(smoothX, [0, 100], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const isNearRightEdge = e.clientX > windowWidth - 150;
      
      // Show liquid nav when cursor is near right edge and on hero section
      if (!isScrolled && isNearRightEdge) {
        setShowLiquidNav(true);
        mouseX.set(e.clientX - (windowWidth - 100));
        mouseY.set(e.clientY - window.innerHeight / 2);
      } else {
        setShowLiquidNav(false);
        mouseX.set(0);
        mouseY.set(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isScrolled, mouseX, mouseY]);

  const menuItems = [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Stories', href: '#stories' },
    { label: 'Product', href: '#product' },
  ];

  return (
    <>
      {/* Liquid Navigation - appears on hero when cursor near right edge */}
      <AnimatePresence>
        {!isScrolled && showLiquidNav && !isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 bottom-0 z-40 pointer-events-none"
          >
            {/* Liquid blob background */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-32 bg-black"
              style={{
                x: blobX,
                scale: blobScale,
                borderRadius: '50px 0 0 50px',
              }}
              animate={{
                borderRadius: [
                  '50px 0 0 50px',
                  '60px 10px 10px 60px',
                  '45px 5px 5px 45px',
                  '50px 0 0 50px',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Menu button inside liquid nav */}
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex flex-col justify-center items-center gap-1.5 pointer-events-auto z-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="w-6 h-0.5 bg-white block" />
              <span className="w-6 h-0.5 bg-white block" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-wide uppercase">
                Hello Monday
              </span>
              <span className="text-sm font-extrabold tracking-wide uppercase">
                / Dept.
              </span>
            </a>

            {/* Right side - only show when scrolled */}
            <motion.div 
              className="flex items-center gap-8"
              animate={{
                opacity: isScrolled ? 1 : 0,
                x: isScrolled ? 0 : 20,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Monday indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <Calendar className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">It&apos;s Monday today!</span>
              </div>

              {/* Menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative w-8 h-8 flex flex-col justify-center items-center gap-1.5 group"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={
                    isMenuOpen
                      ? { rotate: 45, y: 6 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.3 }}
                  className="w-6 h-0.5 bg-black block"
                />
                <motion.span
                  animate={
                    isMenuOpen
                      ? { rotate: -45, y: -6 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.3 }}
                  className="w-6 h-0.5 bg-black block"
                />
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Full screen menu with blob animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Black blob that expands from the right */}
            <motion.div
              initial={{
                clipPath: 'circle(0% at calc(100% - 40px) 50%)',
              }}
              animate={{
                clipPath: 'circle(150% at calc(100% - 40px) 50%)',
              }}
              exit={{
                clipPath: 'circle(0% at calc(100% - 40px) 50%)',
              }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="fixed inset-0 z-[60] bg-black"
            />

            {/* Menu content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
            >
              {/* Close button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white hover:opacity-60 transition-opacity"
              >
                <motion.span
                  className="absolute w-6 h-0.5 bg-white"
                  animate={{ rotate: 45 }}
                />
                <motion.span
                  className="absolute w-6 h-0.5 bg-white"
                  animate={{ rotate: -45 }}
                />
              </button>

              <nav className="flex flex-col items-center gap-6">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.4 + index * 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="text-4xl md:text-6xl lg:text-7xl font-serif text-white hover:text-white/60 transition-colors duration-300"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="absolute bottom-10 flex gap-8"
              >
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Instagram
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Twitter
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
