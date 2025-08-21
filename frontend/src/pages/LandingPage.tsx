import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Star, TrendingUp, Play, Target, Zap, Trophy } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage = () => {
  const [activePlayersCount, setActivePlayersCount] = useState(1247);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlayersCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sports = [
    { name: 'Badminton', icon: '🏸', active: true },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Cricket', icon: '🏏' },
    { name: 'Football', icon: '⚽' },
    { name: 'Basketball', icon: '🏀' },
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8 text-qc-primary" />,
      title: 'Smart Matching',
      description: 'Our Skill-ID system matches you with players of similar ability for better games'
    },
    {
      icon: <Zap className="w-8 h-8 text-qc-accent" />,
      title: 'Instant Booking',
      description: 'Book courts in seconds with real-time availability and secure payment'
    },
    {
      icon: <Trophy className="w-8 h-8 text-qc-lilac" />,
      title: 'Tournament Mode',
      description: 'Create and join tournaments with automated bracket management'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-qc-bg via-white to-qc-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Content */}
            <motion.div className="space-y-8" variants={itemVariants}>
              <div className="space-y-6">
                <motion.h1 
                  className="text-5xl lg:text-6xl font-bold text-qc-text leading-tight"
                  variants={itemVariants}
                >
                  Book courts.{' '}
                  <span className="text-qc-primary">Find teammates.</span>{' '}
                  <span className="text-qc-accent">Play more.</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-600 max-w-lg"
                  variants={itemVariants}
                >
                  Discover local sports venues, connect with players of your skill level, 
                  and book your perfect game in seconds.
                </motion.p>
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <Link to="/courts">
                  <Button size="lg" className="w-full sm:w-auto">
                    <MapPin className="w-5 h-5 mr-2" />
                    Find a Court
                  </Button>
                </Link>
                
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Users className="w-5 h-5 mr-2" />
                    Host a Court
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Strip */}
              <motion.div 
                className="flex items-center space-x-8 pt-8 border-t border-gray-200"
                variants={itemVariants}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-qc-primary">{activePlayersCount.toLocaleString()}</span> active players
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-qc-accent fill-current" />
                  <span className="text-sm font-bold text-qc-text">4.9</span>
                  <span className="text-sm text-gray-600">(2.3k reviews)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-qc-primary" />
                  <span className="text-sm text-gray-600">Growing 25% monthly</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Animation */}
            <motion.div 
              className="relative lg:h-96"
              variants={itemVariants}
            >
              <div className="relative w-full h-full">
                {/* Animated elements */}
                <motion.div
                  className="absolute top-10 left-10 w-20 h-20 bg-qc-accent/20 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute top-20 right-20 w-16 h-16 bg-qc-primary/20 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                <motion.div
                  className="absolute bottom-20 left-20 w-12 h-12 bg-qc-lilac/20 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                />
                
                {/* Main illustration */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <motion.div
                    className="w-64 h-64 bg-gradient-to-br from-qc-primary to-qc-accent rounded-full flex items-center justify-center shadow-2xl"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      rotate: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      },
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    <Play className="w-16 h-16 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div 
          className="absolute top-20 right-10 w-16 h-16 bg-qc-accent/10 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-8 h-8 bg-qc-primary/20 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* Quick Sports Filter */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {sports.map((sport, index) => (
              <motion.button
                key={sport.name}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  sport.active
                    ? 'bg-qc-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <span className="text-lg">{sport.icon}</span>
                <span className="font-medium">{sport.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-qc-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-qc-text mb-4">
              Why QuickCourt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make sports booking effortless with smart matching and instant reservations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} delay={index * 0.2}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-qc-text mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
