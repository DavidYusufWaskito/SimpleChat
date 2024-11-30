<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SendTestController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['middleware' => ['auth:sanctum']], function () {
    // Route::post('/event/messages',[SendTestController::class,'GetMessages']);
    Route::post('/messages',[ChatController::class,'GetMessages']);
    Route::post('/chat', [ChatController::class, 'send'])->name('chat.send');
    Route::post('/user/email/check',[ContactController::class,'CheckEmailExist'])->name('user.email.check');
    
    Route::get('/messages/by-sender/{SenderId}',[ChatController::class,'GetMessagesBySenderId'])->name('messages.by-sender');
    Route::get('/messages/unread/by-sender/{SenderId}',[ChatController::class,'GetUnreadMessagesBySenderId'])->name('messages.unread.by-sender');
    Route::get('/messages/unread/count/{SenderId}/{ReceiverId}',[ChatController::class,'GetUnreadMessagesCountBySenderAndReceiverId'])->name('messages.unread.count');
    Route::put('/messages/read/all/{SenderId}/{ReceiverId}',[ChatController::class,'ReadAllMessagesBySenderAndReceiverId'])->name('messages.read.all');    
});