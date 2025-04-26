'use client'

import { Box, Button, Stack, TextField, InputAdornment, IconButton, Fade, Typography } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import MicIcon from '@mui/icons-material/Mic'
import { useState, useEffect, useRef } from 'react'
import TypingAnimation from './components/TypingAnimation'
import TypedMessage from './components/TypedMessage'

export default function Home() {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  // Initialize chat messages with a welcome message from the AI
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Peace be upon you. I'm Sahabi, your AI assistant. What's up?`
    }
  ])

  // State to manage the current message input and loading state
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  // Initialize speech recognition on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          // Capitalize the first word of the transcript
          const capitalizedTranscript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          setMessage((prevMessage) => prevMessage + capitalizedTranscript);
          setIsListening(false);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const handleMicClick = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (!isListening) {
      recognition.start();
      setIsListening(true);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Add auto-scroll effect
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const scrollHeight = container.scrollHeight;
        const height = container.clientHeight;
        const maxScrollTop = scrollHeight - height;
        container.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
      }
    };

    // Use requestAnimationFrame to ensure smooth scrolling
    requestAnimationFrame(scrollToBottom);
  }, [messages, isLoading]);

  // Function to handle sending messages and receiving streaming responses
  const sendMessage = async () => {
    if (!message.trim()) return;

    // Clear the input field and set loading state
    setMessage('')
    setIsLoading(true)

    // Add the user's message
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message }
    ])

    // Send the chat history to the API and handle streaming response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      // Set up streaming response handling
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // Add an empty assistant message that we'll populate with the stream
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: '' }
      ])

      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the incoming stream
        const text = decoder.decode(value, { stream: true })

        // Update the AI's response message incrementally as chunks arrive
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Main container for the chat interface
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {/* Chat window container */}
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        borderRadius={2}
        padding={2}
        spacing={3}
      >
        {/* Messages display area with scrolling */}
        <Stack
          ref={messagesContainerRef}
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          {/* Render each message with different styling based on sender */}
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={message.role === 'assistant' ? '#E9E9EB' : '#458AF7'}
                color={message.role === 'assistant' ? 'black' : 'white'}
                borderRadius={16}
                padding={3}
              >
                {message.role === 'assistant' ? (
                  <TypedMessage
                    message={message.content}
                    onComplete={() => {
                      if (index === messages.length - 1) {
                        setIsLoading(false);
                      }
                    }}
                    onUpdate={() => {
                      if (messagesContainerRef.current) {
                        const container = messagesContainerRef.current;
                        const scrollHeight = container.scrollHeight;
                        const height = container.clientHeight;
                        const maxScrollTop = scrollHeight - height;
                        container.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
                      }
                    }}
                  />
                ) : (
                  message.content
                )}
              </Box>
            </Box>
          ))}
          {/* Show typing animation when loading */}
          {isLoading && (
            <Box
              display="flex"
              justifyContent="flex-start"
            >
              <Box
                bgcolor="#E9E9EB"
                borderRadius={16}
                sx={{
                  minWidth: 60,
                  minHeight: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TypingAnimation />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>

        {/* Message input area */}
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0.5 }}>
                  <IconButton
                    onClick={handleMicClick}
                    sx={{
                      color: isListening ? '#ff4444' : '#458AF7',
                      padding: '8px',
                      '&:hover': {
                        bgcolor: isListening ? 'rgba(255, 68, 68, 0.1)' : 'rgba(69, 138, 247, 0.1)'
                      }
                    }}
                  >
                    <MicIcon />
                  </IconButton>
                  <IconButton
                    onClick={sendMessage}
                    sx={{
                      bgcolor: '#458AF7',
                      color: 'white',
                      padding: '8px',
                      '&:hover': {
                        bgcolor: '#3573d9'
                      }
                    }}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: '25px',
                '& .MuiOutlinedInput-root': {
                  paddingRight: '8px'
                }
              }
            }}
            sx={{
              '& .MuiInputBase-input::placeholder': {
                color: '#C4C4C6'
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                '& fieldset': {
                  borderColor: '#DFDFDF',
                  borderRadius: '25px',
                },
                '&:hover fieldset': {
                  borderColor: '#DFDFDF'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#DFDFDF'
                }
              }
            }}
          />
        </Stack>
      </Stack>
    </Box>
  )
}