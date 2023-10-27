import { createLogger } from '@utils/logger';
import { ConnectionsDataAccess } from './connectionsDataAccess';
import { Connection } from '@models/Connection';

const logger = createLogger('ConnectionsBusiness');
const connectionsDataAccess = new ConnectionsDataAccess();

export async function createConnection(connectionId: string): Promise<void> {
  try {
    logger.info('Creating new connection');

    const timestamp = String(new Date().getTime());
    const newConnection = {
      id: connectionId,
      timestamp,
    } as Connection;

    await connectionsDataAccess.createConnection(newConnection);

    logger.info('Created new connection');
  } catch (e) {
    logger.error('Fail to create new connection', { error: e });
    throw e;
  }
}

export async function deleteConnection(connectionId: string): Promise<void> {
  try {
    logger.info('Deleting a connection');

    await connectionsDataAccess.deleteConnection(connectionId);

    logger.info('Deleted a connection');
  } catch (e) {
    logger.error('Fail to delete a connection', { error: e });
    throw e;
  }
}

export async function getConnections(): Promise<Connection[]> {
  try {
    logger.info('Getting connections');

    const connections = await connectionsDataAccess.getConnections();

    return connections;
  } catch (e) {
    logger.error('Fail to get connections', { error: e });
    throw e;
  }
}
