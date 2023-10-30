import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { withAuthenticationRequired } from '@auth0/auth0-react';

import Messages from '../components/Messages';
import { config } from '../config';

function Chat() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);

  const { lastMessage } = useWebSocket(config.socketUrl);

  useEffect(() => {
    try {
      fetch(`${config.endpoint}/channels`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          return data.channels.map(channel => ({
            ...channel,
            newMessages: 0,
          }));
        })
        .then(channels => setChannels(channels));
    } catch (e) {
      console.log('Is not possible to get channels');
    }
  }, []);

  useEffect(() => {
    if (!selectedChannel) {
      return;
    }

    try {
      fetch(`${config.endpoint}/channel/${selectedChannel.id}/messages`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          setMessages(data.messages);
          setChannels(c => {
            return c.map(channel => {
              if (selectedChannel.id === channel.id) {
                return { ...channel, newMessages: 0 };
              }
              return channel;
            });
          });
        });
    } catch (e) {
      console.log(
        'Is not possible to get messages from channel: ' + selectedChannel.id,
      );
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    const lastMessageStored = messages.at(-1);
    const lastMessageParsed = JSON.parse(lastMessage.data);

    if (isEqualMessages(lastMessageStored, lastMessageParsed)) {
      return;
    }

    if (isEqualChannel(lastMessageStored, lastMessageParsed)) {
      setMessages(m => [...m, lastMessageParsed]);
    } else {
      setChannels(c => {
        const newChannels = c.map(channel => {
          if (channel.id === lastMessageParsed.channelId) {
            channel.newMessages += 1;
          }
          return channel;
        });
        return newChannels;
      });
    }
  }, [lastMessage]);

  const onSendMessage = message => {
    if (!message) {
      return Promise.resolve();
    }

    try {
      return fetch(`${config.endpoint}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          text: message,
        }),
      })
        .then(response => response.json())
        .then(data => setMessages([...messages, data.message]));
    } catch (e) {
      console.log('is not possible to save a new message');
      return Promise.reject();
    }
  };

  return (
    <div>
      <h1>Channels</h1>
      <div className="row">
        <div className="col col-md-4">
          <ul className="list-group">
            {channels.map(channel => {
              return (
                <li
                  key={channel.id}
                  className={
                    'list-group-item list-group-item-action d-flex justify-content-between align-items-start ' +
                    (selectedChannel && channel.id === selectedChannel.id
                      ? 'active'
                      : '')
                  }
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="ms-2 me-auto">{channel.name}</div>
                  {channel.newMessages > 0 && (
                    <span className="badge bg-primary rounded-pill">
                      {channel.newMessages}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="col col-md-8">
          {selectedChannel && messages && (
            <Messages
              channel={selectedChannel}
              messages={messages}
              onSendMessage={onSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function isEqualMessages(message1, message2) {
  try {
    if (message1.channelId !== message2.channelId) {
      return false;
    }

    if (message1.text !== message2.text) {
      return false;
    }

    if (message1.timestamp !== message2.timestamp) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

function isEqualChannel(message1, message2) {
  try {
    return message1.channelId === message2.channelId;
  } catch (e) {
    return false;
  }
}

export default withAuthenticationRequired(Chat, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <div>Redirecting you to the login page...</div>,
});
