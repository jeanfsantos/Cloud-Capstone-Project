import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useRef, useState } from 'react';

function Messages({ channel, messages, onSendMessage, onDelete }) {
  const ref = useChatScroll(messages);
  const [message, setMessage] = useState('');
  const { user } = useAuth0();

  const onSubmit = e => {
    e.preventDefault();
    onSendMessage(message).then(() => setMessage(''));
  };

  return (
    <div className="card">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{channel.name}</h5>

        <div ref={ref} style={{ overflowY: 'scroll', height: '500px' }}>
          {messages.map(message => {
            return (
              <>
                <div
                  key={message.messageId}
                  className="alert alert-secondary"
                  role="alert"
                >
                  <p className="mb-0">{message.text}</p>
                  <div className="mb-0 d-flex flex-row-reverse">
                    <div className="d-flex flex-column align-items-end">
                      <small>{formatDate(Number(message.createdAt))}</small>
                      {user.sub === message.userId && (
                        <button
                          className="btn btn-link btn-sm"
                          type="button"
                          onClick={() => onDelete(message.messageId)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })}
        </div>

        <form className="d-flex mt-3" onSubmit={onSubmit}>
          <div className="flex-grow-1 me-3">
            <input
              type="text"
              className="form-control"
              onChange={e => setMessage(e.target.value)}
              value={message}
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function useChatScroll(dep) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);

  return ref;
}

function formatDate(timestamp) {
  let objectDate = new Date(timestamp);
  let day = objectDate.getDate();
  let month = objectDate.getMonth() + 1;
  const year = objectDate.getFullYear();
  let hour = objectDate.getHours();
  let minute = objectDate.getMinutes();
  let second = objectDate.getSeconds();

  if (day < 10) {
    day = '0' + day;
  }

  if (month < 10) {
    month = `0${month}`;
  }

  if (hour < 10) {
    hour = `0${hour}`;
  }

  if (minute < 10) {
    minute = `0${minute}`;
  }

  if (second < 10) {
    second = `0${second}`;
  }

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export default Messages;
