'use client'
import { Box, Button, Stack, TextField, InputAdornment, IconButton, Fade } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
  // Initialize chat messages with a welcome message from the AI
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Peace be upon you. I'm Sahabi, your AI assistant. How can I help you today?`
    }
  ])

  // State to manage the current message input
  const [message, setMessage] = useState('')

  // Function to handle sending messages and receiving streaming responses
  const sendMessage = async () => {
    // Clear the input field
    setMessage('')

    // Add the user's message and prepare for AI response
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }  // Empty placeholder for streaming response
    ])

    // Send the chat history to the API and handle streaming response
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      // Set up streaming response handling
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        // Decode the incoming stream
        const text = decoder.decode(value || new Int8Array(), { stream: true })

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
        return reader.read().then(processText)
      })
    })
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
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
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
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Message input area */}
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            // Handle Enter key press to send message
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            // Custom styling for the input field and send button
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {/* Fade in/out send button based on message content */}
                  <Fade in={message.length > 0}>
                    <IconButton
                      onClick={sendMessage}
                      sx={{
                        bgcolor: '#458AF7',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#3573d9'
                        },
                        visibility: message.length > 0 ? 'visible' : 'hidden'
                      }}
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                  </Fade>
                </InputAdornment>
              ),
              sx: {
                borderRadius: '25px',
              }
            }}
            // Custom styling for the TextField component
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