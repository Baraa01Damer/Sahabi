'use client'
import './globals.css';
import { Box, Stack, TextField, IconButton } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked';

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" fill="currentColor" transform="rotate(-90 12 12)" />
  </svg>
);

const TypingIndicator = () => (
  <Box
    display="flex"
    justifyContent="flex-start"
    sx={{ marginBottom: '8px' }}
  >
    <Box
      bgcolor="#e9e9eb"
      sx={{
        padding: '12px',
        borderRadius: '20px 20px 20px 5px',
        position: 'relative',
        display: 'flex',
        gap: '4px',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          width: '20px',
          height: '20px',
          background: 'radial-gradient(circle at 0 0, transparent 20px, #e9e9eb 0)',
          left: '-10px',
          transform: 'translateY(10px)',
        },
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: '8px',
            height: '8px',
            backgroundColor: '#8e8e93',
            borderRadius: '50%',
            animation: 'typing 1.4s infinite',
            animationDelay: `${i * 0.2}s`,
            '@keyframes typing': {
              '0%, 100%': {
                transform: 'translateY(0px)',
              },
              '50%': {
                transform: 'translateY(-5px)',
              },
            },
          }}
        />
      ))}
    </Box>
  </Box>
);

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Peace be upon you! I'm Sahabi, your friendly assistant. How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
    ]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let botResponse = '';
      setMessages((messages) => [...messages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        botResponse += text;

        setMessages((messages) => {
          const newMessages = [...messages];
          newMessages[newMessages.length - 1].content = botResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: '#ffffff',
      }}
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        sx={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
        p={2}
        spacing={2}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
              sx={{
                marginBottom: '8px',
                paddingX: '10px',
              }}
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#e9e9eb'
                    : '#0b93f6'
                }
                color={
                  message.role === 'assistant'
                    ? '#000000'
                    : '#ffffff'
                }
                sx={{
                  maxWidth: '70%',
                  padding: '10px 16px',
                  borderRadius: '18px',
                  fontSize: '15px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                  '& p': {
                    margin: 0,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: marked(message.content) }}
              />
            </Box>
          ))}
          {isTyping && (
            <Box
              display="flex"
              justifyContent="flex-start"
              sx={{
                marginBottom: '8px',
                paddingX: '10px',
              }}
            >
              <Box
                bgcolor="#e9e9eb"
                sx={{
                  padding: '12px',
                  borderRadius: '18px',
                  display: 'flex',
                  gap: '4px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#8e8e93',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes typing': {
                        '0%, 100%': {
                          transform: 'translateY(0px)',
                        },
                        '50%': {
                          transform: 'translateY(-5px)',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            background: '#f5f5f5',
            borderRadius: '20px',
            padding: '8px',
          }}
        >
          <TextField
            fullWidth
            placeholder="Message"
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                padding: '0 8px',
              },
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!message.trim() && true}
            sx={{
              width: '36px',
              height: '36px',
              ...(message.trim() ? {
                background: '#0b93f6',
                '&:hover': {
                  background: '#0a84e1',
                },
                '& svg': {
                  color: 'white',
                },
              } : {
                '& svg': {
                  color: '#0b93f6',
                },
              }),
            }}
          >
            {message.trim() ? <ArrowUpIcon /> : <MicIcon />}
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}