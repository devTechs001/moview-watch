import AIAssistantChat from '../models/AIAssistantChat.js'
import AILearningData from '../models/AILearningData.js'
import AISettings from '../models/AISettings.js'

// @desc    Chat with AI Assistant
// @route   POST /api/ai-assistant/chat
// @access  Private
export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body

    // Check if AI assistant is enabled
    const aiSettings = await AISettings.findOne({ feature: 'assistant' })
    if (!aiSettings || !aiSettings.enabled) {
      return res.status(403).json({ message: 'AI Assistant is currently disabled' })
    }

    // Get or create chat session
    let chat = await AIAssistantChat.findOne({
      user: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 })

    if (!chat) {
      chat = await AIAssistantChat.create({
        user: req.user._id,
        messages: [],
        context,
      })
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    })

    // Generate AI response (simplified - integrate with OpenAI/Claude/etc.)
    const aiResponse = await generateAIResponse(message, chat.messages, context)

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    })

    await chat.save()

    // Log interaction for learning
    await AILearningData.create({
      category: 'interaction',
      data: {
        userMessage: message,
        aiResponse,
        context,
      },
      context: {
        userId: req.user._id,
        action: 'ai_chat',
      },
    })

    res.json({
      response: aiResponse,
      chatId: chat._id,
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get chat history
// @route   GET /api/ai-assistant/history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const chats = await AIAssistantChat.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({ chats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Rate AI response
// @route   POST /api/ai-assistant/rate
// @access  Private
export const rateAIResponse = async (req, res) => {
  try {
    const { chatId, rating, feedback } = req.body

    const chat = await AIAssistantChat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    chat.rating = rating
    chat.feedback = feedback
    await chat.save()

    // Log feedback for learning
    await AILearningData.create({
      category: 'feedback',
      data: {
        chatId,
        rating,
        feedback,
      },
      context: {
        userId: req.user._id,
      },
      confidence: rating / 5, // Convert 1-5 rating to 0-1 confidence
    })

    res.json({ message: 'Feedback recorded' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Toggle AI features (Admin only)
// @route   PUT /api/ai-assistant/toggle/:feature
// @access  Private/Admin
export const toggleAIFeature = async (req, res) => {
  try {
    const { feature } = req.params
    const { enabled } = req.body

    let settings = await AISettings.findOne({ feature })
    
    if (!settings) {
      settings = await AISettings.create({
        feature,
        enabled,
        lastModifiedBy: req.user._id,
      })
    } else {
      settings.enabled = enabled
      settings.lastModifiedBy = req.user._id
      await settings.save()
    }

    // Emit Socket.IO event
    const io = req.app.get('io')
    if (io) {
      io.emit('ai_feature_toggled', { feature, enabled })
    }

    res.json({ settings, message: `AI ${feature} ${enabled ? 'enabled' : 'disabled'}` })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get AI settings (Admin)
// @route   GET /api/ai-assistant/settings
// @access  Private/Admin
export const getAISettings = async (req, res) => {
  try {
    const settings = await AISettings.find()
    res.json({ settings })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Helper function to generate AI response
async function generateAIResponse(userMessage, chatHistory, context) {
  // This is a simplified version. In production, integrate with:
  // - OpenAI GPT-4
  // - Anthropic Claude
  // - Google Gemini
  // - Or your own trained model

  const message = userMessage.toLowerCase()

  // Movie recommendations
  if (message.includes('recommend') || message.includes('suggest')) {
    return "Based on your watch history, I'd recommend checking out our trending action movies! Would you like me to show you the top 5?"
  }

  // Help with navigation
  if (message.includes('how') || message.includes('where')) {
    return "I can help you navigate! You can find movies in the Movies section, manage your profile in Settings, or check out what your friends are watching in the Social Feed."
  }

  // Account help
  if (message.includes('account') || message.includes('subscription')) {
    return "I can help with your account! You can manage your subscription, update payment methods, or change your profile settings. What would you like to do?"
  }

  // Technical support
  if (message.includes('not working') || message.includes('error') || message.includes('problem')) {
    return "I'm sorry you're experiencing issues. Can you tell me more about what's not working? I'll do my best to help or escalate to our support team."
  }

  // Default response
  return "I'm here to help! I can assist with movie recommendations, navigation, account management, and technical support. What would you like to know?"
}

export default {
  chatWithAI,
  getChatHistory,
  rateAIResponse,
  toggleAIFeature,
  getAISettings,
}
