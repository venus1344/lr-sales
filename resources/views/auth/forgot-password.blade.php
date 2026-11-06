@extends('layouts.auth')

@section('title', 'Reset password — ' . config('app.name'))

@section('content')
    <div class="login-box">
        <div class="login-logo">
            <a href="{{ url('/') }}"><b>WeLink</b> Sales</a>
        </div>

        <div class="card">
            <div class="card-body login-card-body">
                <p class="login-box-msg">You forgot your password? Enter your email to reset it.</p>

                @if (session('status'))
                    <div class="alert alert-success">{{ session('status') }}</div>
                @endif

                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0 ps-3">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('password.email') }}" method="post">
                    @csrf
                    <div class="input-group mb-3">
                        <input type="email" name="email"
                               class="form-control @error('email') is-invalid @enderror"
                               placeholder="Email" value="{{ old('email') }}"
                               required autofocus autocomplete="username">
                        <div class="input-group-text"><span class="fa-solid fa-envelope"></span></div>
                        @error('email')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary w-100">Request password reset</button>
                        </div>
                    </div>
                </form>

                <p class="mt-3 mb-0">
                    <a href="{{ route('login') }}">Back to sign in</a>
                </p>
            </div>
        </div>
    </div>
@endsection
