import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Film, Play, Heart, Users, Shield, Zap, Star, TrendingUp, Award } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useEffect, useState } from 'react'

const LandingPage = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    setIsVisible(true)
  }, [])
  const features = [
    {
      icon: Play,
      title: 'Unlimited Streaming',
      description: 'Watch unlimited movies and TV shows anytime, anywhere',
    },
    {
      icon: Heart,
      title: 'Personalized',
      description: 'Get recommendations based on your preferences',
    },
    {
      icon: Users,
      title: 'Social Features',
      description: 'Share, comment, and interact with other movie lovers',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Stream in HD with minimal buffering',
    },
    {
      icon: Film,
      title: 'Vast Library',
      description: 'Access thousands of movies across all genres',
    },
  ]

  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('.features-section')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleGetStarted = () => {
    navigate('/register')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-2 text-white">
              <Film className="w-8 h-8" />
              <span className="text-2xl font-bold">CinemaFlix</span>
            </div>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-white text-purple-600 hover:bg-white/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <motion.div 
            style={{ opacity, scale }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full blur-xl opacity-50"
                />
                <Film className="w-20 h-20 text-white relative z-10" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Unlimited movies, TV shows, and more
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 mb-8"
            >
              Watch anywhere. Cancel anytime. Join millions of users streaming their favorite content with real-time social features.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-white/90 hover:scale-105 transition-transform text-lg px-8 shadow-2xl"
                onClick={handleGetStarted}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Watching Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-2 border-white hover:bg-white/10 hover:scale-105 transition-transform text-lg px-8"
                onClick={scrollToFeatures}
              >
                <Star className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/80">Movies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-white/80">Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">4.9★</div>
                <div className="text-white/80">Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto features-section"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-xl p-6 cursor-pointer backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-12 h-12 text-white mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass rounded-2xl p-12 text-center max-w-3xl mx-auto backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Award className="w-16 h-16 text-white mx-auto mb-6" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users enjoying unlimited entertainment with real-time social features
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-white/90 text-lg px-12 shadow-2xl"
              onClick={handleGetStarted}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Create Free Account
            </Button>
          </motion.div>
          
          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-6 text-white/80"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>50K+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage
