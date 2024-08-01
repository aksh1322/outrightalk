<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
class HomeController extends Controller
{
    public function home(Request $request)
    {
        // $enc = Crypt::encryptString('somnath.mukherjee.johnathon.asraf.malik@dreamztech.com');
        // $dec = Crypt::decryptString($enc);
        // dd($enc, strlen($enc), $dec, strlen($dec));

        return view('welcome');
    }
}
