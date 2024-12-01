<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class ContactController extends Controller
{
    //
    public function v_AddContact()
    {
        return Inertia::render('Contacts/AddContact');
    }

    public function CheckEmailExist(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.email' => 'Invalid email address',
            'email.exists' => 'The user with this email does not exist',
        ]);
        $email = $request->email;
        if ($email === auth()->user()->email) {
            return response()->json(['message' => 'You cannot add yourself as a contact.'], 400);
        }

        $user = User::where('email', $email)->first();
        return response()->json($user, 200);
    }
}
