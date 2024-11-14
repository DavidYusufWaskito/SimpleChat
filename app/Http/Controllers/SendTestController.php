<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\TestEvent;
use App\Models\Chat;

class SendTestController extends Controller
{
    //
    public function SendTest(Request $request)
    {
        $message = $request->message;
        $SenderId = $request->SenderId;
        $ReceiverId = $request->ReceiverId;
        TestEvent::dispatch($message, $SenderId, $ReceiverId);

        $chat = new Chat();
        $chat->sender_id = $SenderId;
        $chat->receiver_id = $ReceiverId;
        $chat->message = $message;
        $chat->send_at = now();
        $chat->save();
        
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
