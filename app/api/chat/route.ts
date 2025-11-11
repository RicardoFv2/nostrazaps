// TurboZaps Chat API
// Sprint 1 - Buyer/Seller communication endpoints

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { sendMessage as sendLNbitsMessage } from '@/lib/lnbits';
import type { CreateMessageRequest, CreateMessageResponse, Message } from '@/types';
import { randomUUID } from 'crypto';

// GET /api/chat - Get messages for an order
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const order_id = searchParams.get('order_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!order_id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'order_id query parameter is required',
        },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = dbHelpers.getOrderById(order_id);
    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Get messages from database
    const messages = dbHelpers.getMessagesByOrderId(order_id, limit, offset) as Message[];

    // Format messages for frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      from: msg.sender,
      to: msg.receiver,
      text: msg.content,
      timestamp: msg.timestamp,
    }));

    return NextResponse.json({
      ok: true,
      messages: formattedMessages,
      count: formattedMessages.length,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
};

// POST /api/chat - Send a message
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateMessageRequest = await request.json();

    // Validate required fields
    if (!body.order_id || !body.sender || !body.receiver || !body.content) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields: order_id, sender, receiver, and content are required',
        },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = dbHelpers.getOrderById(body.order_id);
    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Generate message ID
    const messageId = randomUUID();

    // Create message in database
    const message: Message = {
      id: messageId,
      order_id: body.order_id,
      sender: body.sender,
      receiver: body.receiver,
      content: body.content,
      timestamp: new Date().toISOString(),
    };

    dbHelpers.createMessage(message);

    // Send message via LNbits Nostr
    try {
      await sendLNbitsMessage({
        message: body.content,
        public_key: body.receiver,
      });
      console.log('Message sent via LNbits Nostr:', messageId);
    } catch (lnbitsError) {
      console.error('Error sending message via LNbits (non-fatal):', lnbitsError);
      // Continue even if LNbits sending fails (message is saved in database)
    }

    const response: CreateMessageResponse = {
      ok: true,
      message_id: messageId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to send message',
      },
      { status: 500 }
    );
  }
};

