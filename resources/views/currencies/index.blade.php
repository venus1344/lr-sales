@extends('layouts.app')

@section('title', 'Currencies — ' . config('app.name'))
@section('heading', 'Currencies')

@section('content')
    <livewire:currencies />
@endsection
