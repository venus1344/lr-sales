@extends('layouts.auth')

@section('title', 'Confirm password — ' . config('app.name'))

@section('content')
    <div class="login-box">
        <div class="login-logo">
            <a href="{{ url('/') }}"><b>WeLink</b> Sales</a>
        </div>

        <div class="card">
            <div class="card-body login-card-body">
                <p class="login-box-msg">Please confirm your password before continuing.</p>

                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0 ps-3">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('password.confirm') }}" method="post">
                    @csrf
                    <div class="input-group mb-3">
                        <input type="password" name="password"
                               class="form-control @error('password') is-invalid @enderror"
                               placeholder="Password" required autofocus autocomplete="current-password">
                        <div class="input-group-text"><span class="fa-solid fa-lock"></span></div>
                        @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary w-100">Confirm password</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
