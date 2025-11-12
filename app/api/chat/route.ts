// TurboZaps Chat API
// Sprint 4 - Buyer/Seller Communication System

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { sendMessage as sendLNbitsMessage, getMessages as getLNbitsMessages } from '@/lib/lnbits';
import { ensureValidNostrPubkey } from '@/lib/utils';
import type { CreateMessageRequest, CreateMessageResponse, Message, Order } from '@/types';
import { randomUUID } from 'crypto';

// GET /api/chat - Get messages for an order
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const order_id = searchParams.get('order_id');
    const buyer_pubkey = searchParams.get('buyer_pubkey'); // Optional filter
    const seller_pubkey = searchParams.get('seller_pubkey'); // Optional filter
    const sync = searchParams.get('sync') === 'true'; // Optional: sync with LNbits
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

    console.log(`[GET /api/chat] Fetching messages for order: ${order_id}`);

    // Verify order exists
    const order = dbHelpers.getOrderById(order_id) as Order | undefined;
    if (!order) {
      console.error(`[GET /api/chat] Order not found: ${order_id}`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Get messages from database with optional filtering
    // Note: For better performance with filters, we get all messages and filter in memory
    // In production, you might want to add a composite index or use a more sophisticated query
    let messages: Message[] = [];
    
    if (buyer_pubkey || seller_pubkey) {
      // Get all messages for the order first (we'll filter in memory)
      const allOrderMessages = dbHelpers.getMessagesByOrderId(order_id, 1000, 0) as Message[];
      
      // Filter by buyer or seller
      if (buyer_pubkey) {
        messages = allOrderMessages.filter(
          msg => msg.sender === buyer_pubkey || msg.receiver === buyer_pubkey
        );
      } else if (seller_pubkey) {
        messages = allOrderMessages.filter(
          msg => msg.sender === seller_pubkey || msg.receiver === seller_pubkey
        );
      }
      
      // Apply pagination
      messages = messages.slice(offset, offset + limit);
    } else {
      // Get all messages for the order with pagination
      messages = dbHelpers.getMessagesByOrderId(order_id, limit, offset) as Message[];
    }

    // Optional: Sync with LNbits to get messages from Nostr
    if (sync && order.buyer_pubkey) {
      try {
        console.log(`[GET /api/chat] Syncing messages with LNbits for buyer: ${order.buyer_pubkey.substring(0, 20)}...`);
        const lnbitsMessages = await getLNbitsMessages(order.buyer_pubkey) as unknown[];
        // Note: LNbits returns messages in a different format
        // In a full implementation, we would parse and merge these messages
        console.log(`[GET /api/chat] Retrieved ${Array.isArray(lnbitsMessages) ? lnbitsMessages.length : 0} messages from LNbits`);
      } catch (lnbitsError) {
        console.error(`[GET /api/chat] Error syncing with LNbits (non-fatal):`, lnbitsError);
        // Continue with database messages even if LNbits sync fails
      }
    }

    // Format messages for frontend according to Sprint 4 requirements
    // Determine if sender is buyer or seller
    const formattedMessages = messages.map((msg) => {
      const isFromBuyer = msg.sender === order.buyer_pubkey;
      return {
        id: msg.id,
        from: isFromBuyer ? 'buyer' : 'seller',
        text: msg.content,
        timestamp: msg.timestamp,
        sender_pubkey: msg.sender, // Include for reference
        receiver_pubkey: msg.receiver, // Include for reference
      };
    });

    console.log(`[GET /api/chat] Retrieved ${formattedMessages.length} messages for order: ${order_id}`);

    return NextResponse.json({
      ok: true,
      messages: formattedMessages,
      count: formattedMessages.length,
      order_id,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[GET /api/chat] Error fetching messages:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// POST /api/chat - Send a message
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateMessageRequest = await request.json();

    console.log('[POST /api/chat] Sending message:', {
      order_id: body.order_id,
      sender: body.sender?.substring(0, 20) + '...',
      receiver: body.receiver?.substring(0, 20) + '...',
      content_length: body.content?.length || 0,
    });

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

    // Validate message content
    const content = body.content.trim();
    if (content.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Message content cannot be empty',
        },
        { status: 400 }
      );
    }

    // Maximum message length (adjust as needed)
    const MAX_MESSAGE_LENGTH = 10000;
    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          ok: false,
          error: `Message content exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
          max_length: MAX_MESSAGE_LENGTH,
          current_length: content.length,
        },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = dbHelpers.getOrderById(body.order_id) as Order | undefined;
    if (!order) {
      console.error(`[POST /api/chat] Order not found: ${body.order_id}`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Validate that sender is part of the order (buyer or seller)
    // Note: We can only validate buyer_pubkey directly. For seller, we would need
    // to check the product's stall owner, but that information isn't stored in the order.
    // For now, we'll validate that sender is the buyer, or allow any sender if it's a valid pubkey.
    const isBuyer = body.sender === order.buyer_pubkey;
    
    if (!isBuyer) {
      // In a full implementation, we would validate that the sender is the seller
      // by checking the product's stall owner. For now, we'll allow it but log a warning.
      console.warn(
        `[POST /api/chat] Sender is not the buyer. Sender: ${body.sender.substring(0, 20)}..., ` +
        `Buyer: ${order.buyer_pubkey.substring(0, 20)}...`
      );
    }

    // Validate that receiver is the other party (buyer or seller)
    // Receiver should be either the buyer (if sender is seller) or the seller (if sender is buyer)
    const isReceiverBuyer = body.receiver === order.buyer_pubkey;
    
    if (isBuyer && isReceiverBuyer) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Sender and receiver cannot be the same',
        },
        { status: 400 }
      );
    }

    // Normalize and validate public keys before sending to LNbits
    // LNbits NostrMarket requires keys in hexadecimal format (64 hex characters)
    const normalizedSender = ensureValidNostrPubkey(body.sender, false);
    const normalizedReceiver = ensureValidNostrPubkey(body.receiver, false);

    if (!normalizedSender) {
      console.error(`[POST /api/chat] Invalid sender pubkey format: ${body.sender.substring(0, 20)}...`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid sender public key format. Expected 64-character hexadecimal string.',
          hint: 'LNbits NostrMarket requires public keys in hexadecimal format, not bech32 (npub).',
        },
        { status: 400 }
      );
    }

    if (!normalizedReceiver) {
      console.error(`[POST /api/chat] Invalid receiver pubkey format: ${body.receiver.substring(0, 20)}...`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid receiver public key format. Expected 64-character hexadecimal string.',
          hint: 'LNbits NostrMarket requires public keys in hexadecimal format, not bech32 (npub).',
        },
        { status: 400 }
      );
    }

    // Generate message ID
    const messageId = randomUUID();

    // Create message in database (store normalized keys)
    const message: Message = {
      id: messageId,
      order_id: body.order_id,
      sender: normalizedSender,
      receiver: normalizedReceiver,
      content: content,
      timestamp: new Date().toISOString(),
    };

    dbHelpers.createMessage(message);
    console.log(`[POST /api/chat] Message saved to database: ${messageId}`);

    // Send message via LNbits Nostr (use normalized keys)
    let lnbitsSendSuccess = false;
    try {
      console.log(`[POST /api/chat] Sending message via LNbits Nostr to: ${normalizedReceiver.substring(0, 20)}...`);
      await sendLNbitsMessage({
        message: content,
        public_key: normalizedReceiver, // Use normalized key
      });
      lnbitsSendSuccess = true;
      console.log(`[POST /api/chat] Message sent successfully via LNbits Nostr: ${messageId}`);
    } catch (lnbitsError) {
      console.error(`[POST /api/chat] Error sending message via LNbits:`, lnbitsError);
      
      // Check if it's a critical error
      if (lnbitsError instanceof Error) {
        // For 403, we might not have permission (but this is non-critical for message storage)
        if (lnbitsError.message.includes('403') || lnbitsError.message.includes('forbidden')) {
          console.warn(
            `[POST /api/chat] Permission denied in LNbits. Message saved locally but not sent via Nostr.`
          );
        } else if (lnbitsError.message.includes('invalid public key') || lnbitsError.message.includes('500')) {
          // If it's an invalid public key error, return a more helpful error
          console.error(`[POST /api/chat] Invalid public key error from LNbits. Receiver key: ${normalizedReceiver.substring(0, 20)}...`);
          return NextResponse.json(
            {
              ok: false,
              error: 'Failed to send message via Nostr: Invalid public key',
              message: lnbitsError.message,
              hint: 'The receiver public key may not be valid or registered in LNbits NostrMarket.',
              lnbits_error: lnbitsError.message,
            },
            { status: 400 }
          );
        } else {
          // For other errors (404, network errors, etc.), we can still continue
          console.warn(
            `[POST /api/chat] LNbits error (non-fatal). Message saved locally but may not be sent via Nostr.`
          );
        }
      }
      // Continue even if LNbits sending fails (message is saved in database)
    }

    const response: CreateMessageResponse = {
      ok: true,
      message_id: messageId,
    };

    return NextResponse.json({
      ...response,
      lnbits_synced: lnbitsSendSuccess,
      message: lnbitsSendSuccess
        ? 'Message sent successfully'
        : 'Message saved locally. Nostr delivery may be delayed.',
    });
  } catch (error) {
    console.error('[POST /api/chat] Error sending message:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

