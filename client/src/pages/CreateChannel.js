import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { withAuthenticationRequired } from '@auth0/auth0-react';

import { authConfig, config } from '../config';

function CreateChannel() {
  const [name, setName] = useState('');
  const { getAccessTokenSilently } = useAuth0();

  const onSubmit = event => {
    event.preventDefault();

    if (!name) {
      alert('name is required');
      return;
    }

    createChannel(name);
  };

  const createChannel = async name => {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: authConfig.audience,
        },
      });

      const response = await fetch(`${config.endpoint}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      setName('');

      alert(`Channel created successfully: ${data.channel.name}`);
    } catch (e) {
      console.error(e.message);
    }
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
