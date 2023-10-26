import { Message } from '@models/Message';
import { createLogger } from '@utils/logger';
import { MessagesDataAccess } from './messagesDataAccess';

const logger = createLogger('MessagesBusiness');
const messagesDataAccess = new MessagesDataAccess();

export async function createMessage(
  channelId: string,
  text: string,
): Promise<Message> {
  try {
    logger.info('Creating new message');

    const timestamp = String(new Date().getTime());
    const newMessage = {
      channelId,
      text,
      timestamp,
    } as Message;

    const message = await messagesDataAccess.createMessage(newMessage);

    return message;
  } catch (e) {
    logger.error('Fail to create new message', { error: e });
    throw e;
  }
}
