import { useEffect, useRef, useState } from 'react';

function Messages({ channel, messages, onSendMessage }) {
  const ref = useChatScroll(messages);
  const [message, setMessage] = useState('');

  const onSubmit = e => {
    e.preventDefault();
    onSendMessage(message).then(() => setMessage(''));
  };

  return (
    <div className="card">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{channel.name}</h5>

        <div ref={ref} style={{ overflowY: 'scroll', height: '500px' }}>
          {messages.map((message, index) => {
            return (
              <div
                key={message.timestamp}
                className="alert alert-secondary"
                role="alert"
              >
                <p className="mb-0">{message.text}</p>
                <small className="mb-0 d-flex flex-row-reverse">
                  {formatDate(Number(message.timestamp))}
                </small>
              </div>
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
