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
        $receiverPublicKey = $receiverUser->Keypair->public_key;
        // dd(['receiverPublicKey' => $receiverPublicKey, 'receiverPrivateKey' => $receiverUser->Keypair->private_key]);
        return Inertia::render('Chat/ChatPage', ['senderPrivateKey' => auth()->user()->Keypair->private_key,'senderPublicKey' => auth()->user()->Keypair->public_key,'receiverId' => $receiverId, 'receiverName' => $receiverUser->name,'receiverPublicKey' => $receiverPublicKey]);
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
        $chat->send_at = now(config('app.timezone'));
        $chat->save();
        // Send chat event
        SendChatEvent::dispatch($SenderMessage,$ReceiverMessage, $receiverId, $senderId, now(config('app.timezone')));

        return response()->json(['message' => 'Message sent successfully']);
    }
    public function GetMessages(Request $request)
    {
        $SenderId = $request->SenderId;
        $ReceiverId = $request->ReceiverId;

        $messages = Chat::where(function ($query) use ($SenderId, $ReceiverId) {
            $query->where('sender_id', $SenderId)
                ->where('receiver_id', $ReceiverId);
        })->orWhere(function ($query) use ($SenderId, $ReceiverId) {
            $query->where('sender_id', $ReceiverId)
                ->where('receiver_id', $SenderId);
        })->orderBy('send_at')->get();

        return response()->json([
            'messages' => $messages,
        ], 200);
    }
}
