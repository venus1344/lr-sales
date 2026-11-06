@extends('layouts.app')

@section('title', 'Packages — ' . config('app.name'))
@section('heading', 'Internet packages')

@section('content')
    <livewire:packages />
@endsection
