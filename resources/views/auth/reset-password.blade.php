@extends('layouts.auth')

@section('title', 'Set a new password — ' . config('app.name'))

@section('content')
    <div class="login-box">
        <div class="login-logo">
            <a href="{{ url('/') }}"><b>WeLink</b> Sales</a>
        </div>

        <div class="card">
            <div class="card-body login-card-body">
                <p class="login-box-msg">Set a new password for your account.</p>

                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0 ps-3">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('password.update') }}" method="post">
                    @csrf
                    <input type="hidden" name="token" value="{{ $request->route('token') }}">

                    <div class="input-group mb-3">
                        <input type="email" name="email"
                               class="form-control @error('email') is-invalid @enderror"
                               placeholder="Email" value="{{ old('email', $request->email) }}"
                               required autofocus autocomplete="username">
                        <div class="input-group-text"><span class="fa-solid fa-envelope"></span></div>
                        @error('email')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="input-group mb-3">
                        <input type="password" name="password"
                               class="form-control @error('password') is-invalid @enderror"
                               placeholder="New password" required autocomplete="new-password">
                        <div class="input-group-text"><span class="fa-solid fa-lock"></span></div>
                        @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="input-group mb-3">
                        <input type="password" name="password_confirmation"
                               class="form-control @error('password_confirmation') is-invalid @enderror"
                               placeholder="Confirm new password" required autocomplete="new-password">
                        <div class="input-group-text"><span class="fa-solid fa-lock"></span></div>
                        @error('password_confirmation')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary w-100">Reset password</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
