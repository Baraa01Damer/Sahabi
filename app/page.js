'use client'

import { Box, Button, Stack, TextField, InputAdornment, IconButton, Fade, Typography, Avatar } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import MicIcon from '@mui/icons-material/Mic'
import { useState, useEffect, useRef } from 'react'
import TypingAnimation from './components/TypingAnimation'
import TypedMessage from './components/TypedMessage'
import ImessageHeader from './components/ImessageHeader'
import { IoIosAddCircleOutline } from "react-icons/io";

export default function Home() {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [currentTime, setCurrentTime] = useState('');

  // Welcome message
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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${displayHours}:${minutes} ${period}`);
    };

    // Update time immediately
    updateTime();

    // Update time every minute
    const interval = setInterval(updateTime, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));

    try {
      setIsLoading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      // Add message with images
      setMessages((messages) => [
        ...messages,
        {
          role: 'user',
          images: imageUrls
        }
      ]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      // Handle response similar to text messages
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: '' }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: 'Sorry, I encountered an error processing the images. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      width="100%"
      height="100dvh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={0}
      sx={{
        bgcolor: '#fff',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <ImessageHeader />
      {/* Chat window container */}
      <Stack
        direction="column"
        width="100%"
        height="100%"
        borderRadius={3}
        boxShadow={2}
        bgcolor="#fff"
        padding={0}
        spacing={0}
        sx={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Messages display area with scrolling */}
        <Stack
          ref={messagesContainerRef}
          direction="column"
          spacing={0.5}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          px={1.5}
          pt={2}
          pb={1}
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
            bgcolor: '#fff',
          }}
        >
          {/* Render each message with different styling based on sender */}
          {messages.map((message, index) => (
            message.role === 'assistant' ? (
              <Box key={index} display="flex" alignItems="flex-end" mb={1}>
                <Box>
                  {/* Name and timestamp */}
                  <Typography sx={{ fontSize: 11, color: '#888', ml: 0.5, mb: 0.2 }}>{/*Sahabi ·*/} {currentTime}</Typography>
                  <Box
                    sx={{
                      bgcolor: '#E9E9EB',
                      color: 'black',
                      borderRadius: '18px 18px 18px 4px',
                      px: 2,
                      py: 1,
                      maxWidth: '85vw',
                      fontSize: 15,
                      boxShadow: 1,
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: -6,
                        bottom: 0,
                        width: 20,
                        height: 20,
                        background: '#E9E9EB',
                        borderBottomRightRadius: '50%',
                        zIndex: 0,
                      },
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        left: -20,
                        bottom: 0,
                        width: 20,
                        height: 20,
                        background: '#fff',
                        borderBottomRightRadius: '50%',
                        zIndex: 1,
                      },
                    }}
                  >
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
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box key={index} display="flex" justifyContent="flex-end" mb={1}>
                <Box
                  sx={{
                    bgcolor: '#458AF7',
                    color: 'white',
                    borderRadius: '18px 18px 4px 18px',
                    px: 2,
                    py: 1,
                    maxWidth: '85vw',
                    fontSize: 15,
                    boxShadow: 1,
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      right: -6,
                      bottom: 0,
                      width: 20,
                      height: 20,
                      background: '#458AF7',
                      borderBottomLeftRadius: '50%',
                      zIndex: 0,
                    },
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      right: -20,
                      bottom: 0,
                      width: 20,
                      height: 20,
                      background: '#fff',
                      borderBottomLeftRadius: '50%',
                      zIndex: 1,
                    },
                  }}
                >
                  {message.content}
                  {message.images && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {message.images.map((imageUrl, imgIndex) => (
                        <Box
                          key={imgIndex}
                          component="img"
                          src={imageUrl}
                          alt={`Uploaded image ${imgIndex + 1}`}
                          sx={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 2,
                            maxHeight: '200px',
                            objectFit: 'contain'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )
          ))}
          {/* Show typing animation when loading */}
          {isLoading && (
            <Box display="flex" alignItems="flex-end" mb={1}>
              <Box
                bgcolor="#E9E9EB"
                borderRadius="18px 18px 18px 4px"
                sx={{
                  minWidth: 60,
                  minHeight: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 2,
                  py: 1,
                  boxShadow: 1,
                  position: 'relative',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: -6,
                    bottom: 0,
                    width: 20,
                    height: 20,
                    background: '#E9E9EB',
                    borderBottomRightRadius: '50%',
                    zIndex: 0,
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    left: -20,
                    bottom: 0,
                    width: 20,
                    height: 20,
                    background: '#fff',
                    borderBottomRightRadius: '50%',
                    zIndex: 1,
                  },
                }}
              >
                <TypingAnimation />
              </Box>
            </Box>
          )}
        </Stack>
        {/* Input area */}
        <Stack direction="row" spacing={1} px={2} py={1} bgcolor="#fff">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <IconButton
            onClick={handleImageClick}
            sx={{ alignSelf: 'center', mb: 1 }}
          >
            <IoIosAddCircleOutline size={30} />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            multiline
            maxRows={4}
            InputProps={{
              sx: { borderRadius: 8, bgcolor: '#f7f7f7' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleMicClick}
                    color={isListening ? 'error' : 'default'}
                    sx={{ mr: 1 }}
                  >
                    <MicIcon />
                  </IconButton>
                  <IconButton
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading}
                    color="primary"
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
    </Box>
  )
}