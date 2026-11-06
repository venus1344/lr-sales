@extends('layouts.auth')

@section('title', 'Verify email — ' . config('app.name'))

@section('content')
    <div class="login-box">
        <div class="login-logo">
            <a href="{{ url('/') }}"><b>WeLink</b> Sales</a>
        </div>

        <div class="card">
            <div class="card-body login-card-body">
                <p class="login-box-msg">
                    Thanks for signing up! Before getting started, verify your email address
                    by clicking the link we just emailed to you.
                </p>

                @if (session('status') === 'verification-link-sent')
                    <div class="alert alert-success">
                        A new verification link has been sent to your email address.
                    </div>
                @endif

                <div class="mt-3 d-flex justify-content-between align-items-center">
                    <form method="POST" action="{{ route('verification.send') }}">
                        @csrf
                        <button type="submit" class="btn btn-primary">
                            Resend verification email
                        </button>
                    </form>

                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="btn btn-outline-secondary">Log out</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
