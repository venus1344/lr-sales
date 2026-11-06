@extends('layouts.app')

@section('title', 'Dashboard — ' . config('app.name'))
@section('heading', 'Dashboard')

@section('content')
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Welcome, {{ auth()->user()->name }}</h5>
                    <p class="text-muted mb-0">The sales dashboard is coming in a later phase.</p>
                </div>
            </div>
        </div>
    </div>
@endsection
