# 📡 WebSocket Chat Usage Guide

## Setup đã hoàn tất ✅

WebSocket chat service đã được cấu hình với STOMP protocol và JWT authentication.

## Sử dụng trong React Components

### 1. Import hook

```javascript
import { useWebsocket } from '../../context/WsContext';
```

### 2. Sử dụng trong component

```javascript
const MyComponent = () => {
  const { 
    chatConnected,           // Boolean: trạng thái kết nối chat
    notifyConnected,         // Boolean: trạng thái kết nối notification
    sendMessageToUser,       // Function: gửi message đến user
    subscribeChat,           // Function: subscribe vào destination
    disconnect              // Function: ngắt kết nối
  } = useWebsocket();

  // ... component logic
};
```

### 3. Gửi tin nhắn đến user

```javascript
// Cách 1: Sử dụng sendMessageToUser (Recommended)
const handleSendMessage = () => {
  const recipientId = 'user-uuid-here';
  const message = 'Hello, how are you?';
  
  const success = sendMessageToUser(recipientId, message);
  
  if (success) {
    console.log('Message sent successfully!');
  }
};

// Cách 2: Gửi với extra data
const handleSendRichMessage = () => {
  sendMessageToUser('recipient-id', 'Hello!', {
    conversationId: 'conv-123',
    type: 'text',
    metadata: { read: false }
  });
};
```

### 4. Subscribe nhận tin nhắn

```javascript
useEffect(() => {
  if (!chatConnected || !user?.id) return;

  // Subscribe vào personal message queue
  const destination = `/user/${user.id}/queue/messages`;
  
  const unsubscribe = subscribeChat(destination, (message) => {
    console.log('Received message:', message);
    
    // Handle different message types
    switch (message.type) {
      case 'chat':
        // Handle chat message
        console.log('From:', message.from);
        console.log('Content:', message.message);
        break;
      case 'welcome':
        console.log('Welcome message:', message.message);
        break;
      default:
        console.log('Unknown message type:', message);
    }
  });

  // Cleanup subscription khi unmount
  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}, [chatConnected, subscribeChat, user?.id]);
```

### 5. Complete example - Chat component

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useWebsocket } from '../../context/WsContext';
import { useAuth } from '../../context/AuthContext';

export const ChatComponent = ({ recipientId, recipientName }) => {
  const { user } = useAuth();
  const { chatConnected, sendMessageToUser, subscribeChat } = useWebsocket();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Subscribe để nhận tin nhắn
  useEffect(() => {
    if (!chatConnected || !user?.id) return;

    const destination = `/user/${user.id}/queue/messages`;
    
    const unsubscribe = subscribeChat(destination, (msg) => {
      if (msg.type === 'chat' && msg.from === recipientId) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: msg.message,
          from: msg.from,
          timestamp: msg.timestamp,
          isOwn: false
        }]);
      }
    });

    return () => unsubscribe?.();
  }, [chatConnected, recipientId, subscribeChat, user?.id]);

  // Gửi tin nhắn
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !chatConnected) return;

    const success = sendMessageToUser(recipientId, inputText);
    
    if (success) {
      // Thêm message vào UI (optimistic update)
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: inputText,
        from: user.id,
        timestamp: new Date().toISOString(),
        isOwn: true
      }]);
      
      setInputText('');
    }
  }, [inputText, chatConnected, recipientId, sendMessageToUser, user?.id]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {recipientName}</h2>
        <div className={`status ${chatConnected ? 'online' : 'offline'}`}>
          {chatConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      <div className="messages-list">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`message ${msg.isOwn ? 'own' : 'other'}`}
          >
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={!chatConnected}
        />
        <button 
          onClick={handleSend} 
          disabled={!chatConnected || !inputText.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};
```

## Message Format

### Gửi (Client → Server)

```javascript
{
  to: "recipient-user-id",      // Required: ID của người nhận
  message: "Hello!",             // Required: Nội dung tin nhắn
  conversationId: "conv-123",    // Optional: ID cuộc hội thoại
  type: "text",                  // Optional: Loại tin nhắn
  // ... các fields khác
}
```

### Nhận (Server → Client)

```javascript
{
  type: "chat",                  // Loại message: 'chat', 'welcome', etc
  from: "sender-user-id",        // ID người gửi
  message: "Hello!",             // Nội dung
  timestamp: "2025-11-19T...",   // ISO timestamp
  // ... các fields khác được gửi kèm
}
```

## Notification WebSocket

Tương tự với chat, nhưng sử dụng:
- `notifyConnected` - Kiểm tra connection
- `subscribeNotify` - Subscribe vào notification topics

```javascript
useEffect(() => {
  if (!notifyConnected || !user?.id) return;

  const topic = `/topic/notification/${user.id}`;
  
  const unsubscribe = subscribeNotify(topic, (notification) => {
    console.log('New notification:', notification);
    // Handle notification (show toast, update badge, etc)
  });

  return () => unsubscribe?.();
}, [notifyConnected, subscribeNotify, user?.id]);
```

## Troubleshooting

### Message không được gửi
- Kiểm tra `chatConnected === true`
- Kiểm tra `recipientId` hợp lệ
- Xem console logs để biết lỗi cụ thể

### Không nhận được message
- Đảm bảo đã subscribe đúng destination
- Destination phải là: `/user/${user.id}/queue/messages`
- Kiểm tra backend logs

### Connection bị ngắt liên tục
- Kiểm tra JWT token còn hạn
- Xem backend logs để biết lỗi authentication
- Token sẽ tự động refresh khi hết hạn

## Advanced Usage

### Gửi message với low-level API

Nếu cần control nhiều hơn, dùng `sendChat`:

```javascript
const { sendChat } = useWebsocket();

// Gửi đến custom destination
sendChat('/app/chat', {
  to: 'recipient-id',
  message: 'Hello',
  customField: 'value'
});
```

### Subscribe nhiều destinations

```javascript
useEffect(() => {
  if (!chatConnected) return;

  const unsubscribes = [];

  // Subscribe destination 1
  unsubscribes.push(
    subscribeChat('/user/queue/messages', handleMessage1)
  );

  // Subscribe destination 2
  unsubscribes.push(
    subscribeChat('/topic/public', handleMessage2)
  );

  return () => {
    unsubscribes.forEach(unsub => unsub?.());
  };
}, [chatConnected, subscribeChat]);
```

## Backend Integration

Backend endpoints đã được setup:
- WebSocket endpoint: `ws://localhost:8080/ws-chat`
- Protocol: STOMP over WebSocket
- Authentication: JWT Bearer token
- Auto-reconnect: Có (khi token expired)

Xem thêm tại: [DEBUG_WEBSOCKET.md](./DEBUG_WEBSOCKET.md)
