<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\TestEvent;
use App\Events\SendChatEvent;
use App\Models\Chat;
use App\Models\User;

class ChatController extends Controller
{
    //
    public function index($receiverId)
    {
        $receiverUser = User::find($receiverId);
        
        return Inertia::render('Chat/ChatPage', ['receiverId' => $receiverId, 'receiverName' => $receiverUser->name,'receiverPublicKey' => $receiverUser->public_key]);
    }

    public function send(Request $request)
    {
        $ReceiverMessage = $request->receiver_message;
        $SenderMessage = $request->sender_message;
        $senderId = $request->SenderId;
        $receiverId = $request->ReceiverId;

        $chat = new Chat();
        $chat->sender_id = $senderId;
        $chat->receiver_id = $receiverId;
        $chat->receiver_message = $ReceiverMessage;
        $chat->sender_message = $SenderMessage;
        $chat->send_at = now();
        $chat->save();
        // Send chat event
        SendChatEvent::dispatch($SenderMessage,$ReceiverMessage, $receiverId, $senderId);

        return response()->json(['message' => 'Message sent successfully']);
    }
}
