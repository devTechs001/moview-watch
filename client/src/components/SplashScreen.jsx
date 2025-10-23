import React from 'react'
import { motion } from 'framer-motion'
import { Film, Play, Star, Sparkles } from 'lucide-react'

function SplashScreen() {
  const [dimensions, setDimensions] = React.useState({ width: 1920, height: 1080 })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => {
          const randomX1 = Math.random() * dimensions.width
          const randomY1 = Math.random() * dimensions.height
          const randomX2 = Math.random() * dimensions.width
          const randomY2 = Math.random() * dimensions.height
          const randomDuration = Math.random() * 5 + 3

          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: randomX1,
                y: randomY1,
              }}
              animate={{
                x: randomX2,
                y: randomY2,
                scale: [1, 2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </div>

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="text-center relative z-10">
        {/* Main logo with enhanced animations */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-30 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Film icon with rotation */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Film className="w-24 h-24 text-white relative z-10" strokeWidth={1.5} />
            </motion.div>

            {/* Play button overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Play className="w-10 h-10 text-white fill-white" />
            </motion.div>

            {/* Sparkles */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: i === 0 ? '-20px' : i === 1 ? '-20px' : '100px',
                  left: i === 0 ? '-20px' : i === 1 ? '100px' : i === 2 ? '-20px' : '100px',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Title with gradient text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.h1
            className="text-7xl font-bold text-white mb-4 tracking-tight"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            CinemaFlix
          </motion.h1>
          
          <motion.p
            className="text-xl text-white/90 font-light mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your Ultimate Movie Experience
          </motion.p>

          {/* Star rating animation */}
          <motion.div
            className="flex justify-center gap-1 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Loading dots with enhanced animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full shadow-lg"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.5, 1, 0.5],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="text-white/70 text-sm mt-4 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading your cinematic journey...
        </motion.p>
      </div>
    </div>
  )
}

export default SplashScreen
