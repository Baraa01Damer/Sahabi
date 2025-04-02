# Sahabi - AI Chat Assistant

## Overview

Sahabi is a modern, real-time AI chat assistant built with Next.js and Material-UI. The application demonstrates proficiency in full-stack development, real-time data streaming, and modern web technologies.

## Technical Stack

### Frontend
- **Next.js 14** - Utilizing the latest features of React and server components
- **Material-UI** - Implementing a responsive and accessible design system
- **Custom SVG Icons** - Hand-crafted SVG components for optimal performance
- **CSS-in-JS** - Sophisticated styling with emotion/styled-components
- **Real-time Updates** - Streaming responses with minimal latency

### Backend
- **Server-Side Streaming** - Implementing chunked transfer encoding
- **API Integration** - Secure handling of AI model interactions
- **Error Handling** - Robust error management and graceful fallbacks

## Key Features

- **Real-time Response Streaming** - Character-by-character streaming of AI responses
- **iMessage-inspired UI** - Professional-grade user interface matching iOS design standards
- **Responsive Design** - Seamless experience across all device sizes
- **Intelligent State Management** - Efficient handling of chat history and UI states
- **Typing Indicators** - Dynamic loading states with custom animations
- **Markdown Support** - Rich text formatting in messages

## Technical Implementations

### Stream Processing
```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value, { stream: true });
  // Real-time UI updates
}
```

### Custom Components
- Implemented custom SVG icons for optimal performance
- Built reusable UI components with Material-UI
- Created smooth animations using CSS keyframes

### Performance Optimizations
- Efficient DOM updates using React's virtual DOM
- Optimized re-renders with proper state management
- Minimal bundle size through code splitting

## Development Practices

- **Clean Code** - Following SOLID principles and best practices
- **Component Architecture** - Modular and reusable component design
- **Type Safety** - Utilizing TypeScript for enhanced code reliability
- **Modern JavaScript** - ES6+ features and async/await patterns
- **Version Control** - Git workflow with meaningful commit messages

## Future Enhancements

- Voice input/output capabilities
- Multi-language support
- Enhanced markdown rendering
- OAuth integration
- Progressive Web App features

## Running Locally

```bash
# Clone the repository
git clone https://github.com/baraa01damer/sahabi.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Contact

For any inquiries about my development experience or this project, please reach out on [LinkedIn](https://www.linkedin.com/in/baraadamer/).

## License

MIT License - feel free to use this code for your own projects.