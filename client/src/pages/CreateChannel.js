import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { withAuthenticationRequired } from '@auth0/auth0-react';

import { config } from '../config';

function CreateChannel() {
  const [name, setName] = useState('');
  const { user } = useAuth0();

  console.log(user);

  const onSubmit = event => {
    event.preventDefault();

    if (!name) {
      alert('name is required');
      return;
    }

    createChannel(name);
  };

  const createChannel = name => {
    fetch(`${config.endpoint}/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    })
      .catch(err => {
        throw new Error(err.message);
      })
      .then(response => response.json())
      .then(data =>
        alert(`Channel created successfully: ${data.channel.name}`),
      );
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label htmlFor="channelName" className="form-label" autoComplete="off">
          Channel name
        </label>
        <input
          type="text"
          className="form-control"
          id="channelName"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Create
      </button>
    </form>
  );
}

export default withAuthenticationRequired(CreateChannel, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <div>Redirecting you to the login page...</div>,
});
