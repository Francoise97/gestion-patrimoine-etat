<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(Service::orderBy('nom')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:services,code',
            'ministere' => 'nullable|string|max:255',
        ]);

        return response()->json(Service::create($data), 201);
    }
}