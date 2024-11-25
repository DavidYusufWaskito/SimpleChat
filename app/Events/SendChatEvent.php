<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SendChatEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $sender_message;
    public $receiver_message;
    public $senderId;
    public $receiverId;
    /**
     * Create a new event instance.
     */
    public function __construct($SenderMessage, $ReceiverMessage,$ReceiverId, $SenderId)
    {
        //
        $this->sender_message = $SenderMessage;
        $this->receiver_message = $ReceiverMessage;
        $this->receiverId = $ReceiverId;
        $this->senderId = $SenderId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat-channel.' . $this->receiverId),
        ];
    }
}
