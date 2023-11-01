import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { randomUUID } from 'crypto';

import { PayloadResponse } from '@functions/dynamoDB/sendMessage/payloadFactory';
import { deleteConnection } from '@helpers/connections/connectionsBusiness';
import { Message } from '@models/Message';
import { User } from '@models/User';
import { createLogger } from '@utils/logger';
import { MessagesDataAccess } from './messagesDataAccess';

const logger = createLogger('MessagesBusiness');
const messagesDataAccess = new MessagesDataAccess();

const connectionParams = {
  endpoint: process.env.API_GATEWAY_URL,
};

const apiGateway = new ApiGatewayManagementApiClient(connectionParams);

export async function createMessage(
  channelId: string,
  text: string,
  user: User,
): Promise<Message> {
  try {
    logger.info('Creating new message');

    const messageId = randomUUID();
    const createdAt = String(new Date().getTime());
    const newMessage = {
      channelId,
      text,
      createdAt,
      user,
      messageId,
      userId: user.sub,
    } as Message;

    const message = await messagesDataAccess.createMessage(newMessage);

    return message;
  } catch (e) {
    logger.error('Fail to create new message', { error: e });
    throw e;
  }
}

export async function sendMessageToClient(
  connectionId: string,
  payload: PayloadResponse,
): Promise<void> {
  try {
    logger.info(`Sending message to a connection: ${connectionId}`);

    const postToConnectionCommand = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload),
    });

    logger.info(`API Gateway: ${process.env.API_GATEWAY_URL}`);

    await apiGateway.send(postToConnectionCommand);
  } catch (e) {
    logger.error('Failed to send message:', { error: e });

    if (e.statusCode === 410) {
      logger.info(`Stale connection: ${connectionId}`);

      await deleteConnection(connectionId);
    }

    throw e;
  }
}

export async function getMessagesByChannel(
  channelId: string,
): Promise<Message[]> {
  try {
    logger.info(`Getting messages by channel ${channelId}`);

    const messages = await messagesDataAccess.getMessagesByChannel(channelId);

    return messages;
  } catch (e) {
    logger.error(`Fail to get messages by channel ${channelId}`, {
      error: e,
    });
    throw e;
  }
}

export async function deleteMessageById(
  userId: string,
  messageId: string,
): Promise<void> {
  try {
    logger.info(`Deleting a message by id ${messageId} for userId ${userId}`);

    await messagesDataAccess.deleteMessageById(userId, messageId);
  } catch (e) {
    logger.error(
      `Fail to delete a message id: ${messageId} for userId: ${userId}`,
      {
        error: e,
      },
    );
    throw e;
  }
}

export async function updateMessage(
  userId: string,
  messageId: string,
  text: string,
): Promise<Message> {
  try {
    logger.info(`Updating a messageId ${messageId} for userId ${userId}`);

    const message = await messagesDataAccess.updateMessage(
      userId,
      messageId,
      text,
    );

    return message;
  } catch (e) {
    logger.error(
      `Fail to update a messageId: ${messageId} for userId: ${userId}`,
      {
        error: e,
      },
    );
    throw e;
  }
}
