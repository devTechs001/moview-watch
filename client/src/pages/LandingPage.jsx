import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Play, Heart, Users, Shield, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'

const LandingPage = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        
        <div className="container mx-auto px-4 py-20">
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
          <div className="text-center max-w-4xl mx-auto mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-7xl font-bold text-white mb-6"
            >
              Unlimited movies, TV shows, and more
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-white/90 mb-8"
            >
              Watch anywhere. Cancel anytime. Join millions of users streaming their favorite content.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8">
                  Start Watching Now
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10 text-lg px-8"
                onClick={() => {
                  // Scroll to features section
                  const featuresSection = document.querySelector('.features-section')
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                Learn More
              </Button>
            </motion.div>
          </div>

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
                className="glass rounded-xl p-6 hover:scale-105 transition-transform"
              >
                <feature.icon className="w-12 h-12 text-white mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="glass rounded-2xl p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users enjoying unlimited entertainment
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 text-lg px-12">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
