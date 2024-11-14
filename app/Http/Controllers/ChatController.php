<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\TestEvent;
use App\Models\User;

class ChatController extends Controller
{
    //
    public function index($receiverId)
    {
        $receiverUser = User::find($receiverId);
        return Inertia::render('Chat/ChatPage', ['receiverId' => $receiverId, 'receiverName' => $receiverUser->name]);
    }

    public function send(Request $request)
    {
        $message = $request->message;
        $senderId = $request->senderId;
        $receiverId = $request->receiverId;

        // Test event
        TestEvent::dispatch($message, $senderId, $receiverId);

        return response()->json(['message' => 'Message sent successfully']);
    }
}
