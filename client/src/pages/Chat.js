import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

import Messages from '../components/Messages';
import { authConfig, config } from '../config';

function Chat() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  const { lastMessage } = useWebSocket(config.socketUrl);

  useEffect(() => {
    const getChannels = async () => {
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: authConfig.audience,
          },
        });

        const response = await fetch(`${config.endpoint}/channels`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();

        const channels = data.channels.map(channel => ({
          ...channel,
          newMessages: 0,
        }));

        setChannels(channels);
      } catch (e) {
        console.log('Is not possible to get channels', e);
      }
    };

    getChannels();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        if (!selectedChannel) {
          return;
        }

        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: authConfig.audience,
          },
        });

        const response = await fetch(
          `${config.endpoint}/channel/${selectedChannel.id}/messages`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = await response.json();

        setMessages(data.messages);
        setChannels(c => {
          return c.map(channel => {
            if (selectedChannel.id === channel.id) {
              return { ...channel, newMessages: 0 };
            }
            return channel;
          });
        });
      } catch (e) {
        console.log(
          'Is not possible to get messages from channel: ' + selectedChannel.id,
        );
      }
    };

    getMessages();
  }, [getAccessTokenSilently, selectedChannel]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    const lastMessageParsed = JSON.parse(lastMessage.data);

    if (lastMessageParsed.eventName === 'INSERT') {
      if (selectedChannel.id === lastMessageParsed.payload.channelId) {
        setMessages(m => [...m, lastMessageParsed.payload]);
      } else {
        setChannels(c => {
          const newChannels = c.map(channel => {
            if (channel.id === lastMessageParsed.payload.channelId) {
              channel.newMessages += 1;
            }
            return channel;
          });
          return newChannels;
        });
      }
      return;
    }

    if (lastMessageParsed.eventName === 'REMOVE') {
      const newMessages = messages.filter(
        message => message.messageId !== lastMessageParsed.payload.messageId,
      );
      if (newMessages.length !== messages.length) {
        setMessages(msgs => {
          const newMessages = msgs.filter(
            m => m.messageId !== lastMessageParsed.payload.messageId,
          );
          return newMessages;
        });
      }
    }
  }, [lastMessage, selectedChannel]);

  const onSendMessage = async message => {
    try {
      if (!message) {
        return Promise.resolve();
      }

      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: authConfig.audience,
        },
      });

      const response = await fetch(`${config.endpoint}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          text: message,
        }),
      });

      await response.json();
    } catch (e) {
      console.log('is not possible to save a new message');
      return Promise.reject();
    }
  };

  const onDelete = async messageId => {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: authConfig.audience,
        },
      });

      await fetch(`${config.endpoint}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      console.error(e.message);
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
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(Chat, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <div>Redirecting you to the login page...</div>,
});
