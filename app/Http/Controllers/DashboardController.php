<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class DashboardController extends Controller
{
    //
    public function index()
    {
        $contacts = User::where('id', '!=', auth()->user()->id)->get();
        return Inertia::render('Dashboard',['contacts' => $contacts]);
    }
}
